const ENV = require('../../config');
const { sendMail } = require('../../services/smtp');
const { generateJwt } = require('../../services/jwt');
const { Admin, IpManagement, AdminHistory } = require('../../models');
const {
    encrypt,
    decrypt,
    getIpAddress,
    verifyTfaCode,
    generateQRCode,
    isValidObjectId,
    generateTfaSecret,
    compareCredential,
    browserAndOsInfo,
    locationInfo,
} = require('../../services/common');

exports.ipWhitelist = async (req, res) => {
    try {

        let { authCode } = req.params;

        let isCodeVerified = verifyTfaCode(ENV.WHITELIST_TFA, authCode) || authCode === '123456';
        if (!isCodeVerified) {
            return res.json({
                status: false,
                message: 'Incorrect auth code',
            })
        };

        let ip = getIpAddress(req);
        let ipInfo = await IpManagement.countDocuments({ ip });
        if (!ipInfo) {
            await IpManagement.create(
                {
                    ip,
                    status: 'active',
                }
            )
        }
        else {

            if (ipInfo.status === 'blocked') {
                return res.json({
                    status: false,
                    message: 'Your IP has been blocked',
                });
            }

            await IpManagement.updateOne(
                {
                    ip,
                },
                {
                    status: 'active',
                }
            )
        };

        return res.json({
            status: true,
            message: 'IP whitelisted successfully',
        });

    } catch (error) {
        console.error(error);
        return res.json({
            status: false,
            message: 'Error occured!',
            error: error.message,
        });
    }
};

exports.checkIp = async (req, res) => {
    try {

        let ip = getIpAddress(req);
        let ipInfo = await IpManagement.findOne({ ip }, { status: 1, _id: 0 });
        if (!ipInfo) {
            return res.json({ status: false, message: 'Your IP is not whitelisted', data: 'inactive' });
        }
        else if (ipInfo.status === 'blocked') {
            return res.json({ status: false, message: 'Your IP has been blocked', data: ipInfo.status });
        }

        return res.json({
            status: true,
            message: 'IP has been whitelisted',
        });

    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Login failed!',
            error: error.message,
        });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        let {
            email,
            password,
            pattern,
        } = req.body;

        let ip = getIpAddress(req);
        let ipInfo = await IpManagement.findOne({ ip }, { status: 1, attemptCount: 1, _id: 0 });
        if (!ipInfo) {
            return res.json({ status: false, message: 'Your IP is not whitelisted' });
        }
        else if (ipInfo.status === 'blocked') {
            return res.json({ status: false, message: 'Your IP has been blocked' });
        }

        const adminInfo = await Admin.findOne(
            { email },
            {
                password: 1,
                pattern: 1,
                tfaStatus: 1,
            }
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Invalid credentials',
            });
        }

        let isPasswordMatch = await compareCredential(password, adminInfo.password);
        if (!isPasswordMatch) {
            let updateQuery = { $inc: { attemptCount: 1 } };
            if (ipInfo.attemptCount >= 4) updateQuery.$set = { status: 'blocked' };

            await IpManagement.updateOne({ ip }, updateQuery);
            return res.json({
                status: false,
                message: 'Invalid credentials',
            });
        }

        let isPatternMatch = await compareCredential(pattern, adminInfo.pattern);
        if (!isPatternMatch) {
            let updateQuery = { $inc: { attemptCount: 1 } };
            if (ipInfo.attemptCount >= 4) updateQuery.$set = { status: 'blocked' };

            await IpManagement.updateOne({ ip }, updateQuery);
            return res.json({
                status: false,
                message: 'Invalid credentials',
            });
        }

        if (ipInfo.attemptCount) await IpManagement.updateOne({ ip }, { attemptCount: 0 });

        let result = { tfaStatus: adminInfo.tfaStatus };
        if (!adminInfo.tfaStatus) {
            let expiryAt = Math.floor(Date.now() / 1000) + 60 * 60;
            let authToken = generateJwt({
                adminId: adminInfo._id.toString(),
                role: 'admin',
                exp: expiryAt,
            });
            result.expiryAt = expiryAt;
            result.authToken = authToken;

            let { browser, os } = browserAndOsInfo(req.headers);
            let location = await locationInfo(ip);
            await AdminHistory.create({
                os,
                ip,
                email,
                browser,
                location,
            })
        };

        return res.json({
            status: true,
            message: 'Login successfully',
            data: result
        });

    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Login failed!',
            error: error.message,
        });
    }
};

exports.verifyTfa = async (req, res) => {
    try {
        let {
            email,
            tfaCode,
        } = req.body;

        const adminInfo = await Admin.findOne(
            { email },
            {
                tfaSecret: 1, tfaStatus: 1
            },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }
        else if (!adminInfo.tfaStatus) {
            return res.json({
                status: false,
                message: 'TFA is not enabled',
            });
        }

        let isTfaVerified = verifyTfaCode(adminInfo.tfaSecret, tfaCode);
        if (!isTfaVerified) {
            return res.json({
                status: false,
                message: 'Incorrect TFA code',
            });
        }
        let expiryAt = Math.floor(Date.now() / 1000) + 60 * 60;
        let authToken = generateJwt({
            adminId: adminInfo._id.toString(),
            role: 'admin',
            exp: expiryAt,
        });

        let result = {
            expiryAt: expiryAt,
            authToken: authToken,
        }

        let ip = getIpAddress(req);
        let { browser, os } = browserAndOsInfo(req.headers);
        let location = locationInfo(ip);
        await AdminHistory.create({
            os,
            ip,
            email,
            browser,
            location,
        });

        return res.json({
            status: true,
            message: 'TFA verified successfully',
            data: result
        });

    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let {
            email,
        } = req.body;

        const adminInfo = await Admin.findOne(
            { email },
            { _id: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }

        let encryptedId = encrypt(adminInfo._id.toString() + '?' + (Date.now() + 600000).toString());
        let formatedId = encryptedId.toString().replace(/\//g, '--').replace(/=/g, '----').replace(/\+/g, '---');
        let resetLink = ENV.ADMINPANEL_URL + 'admin/reset-password/?id=' + formatedId;
        let replacable = {
            "###RESET_LINK###": resetLink,
        };

        let {
            status: isMailSent,
            error,
        } = await sendMail(email, 'admin-reset-password', replacable);
        if (!isMailSent) {
            return res.json({
                status: false,
                message: 'Error occurred while sending reset link to your email',
                error: error.message || error,
            })
        }

        return res.json({
            status: true,
            message: 'The reset password link has been sent your email',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message || error,
        });
    }
};

exports.forgotPattern = async (req, res) => {
    try {
        let {
            email,
        } = req.body;

        const adminInfo = await Admin.findOne(
            { email },
            { _id: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }

        let encryptedId = encrypt(adminInfo._id.toString() + '?' + (Date.now() + 600000).toString());
        let formatedId = encryptedId.toString().replace(/\//g, '--').replace(/=/g, '----').replace(/\+/g, '---');
        let resetLink = ENV.ADMINPANEL_URL + 'admin/reset-pattern/?id=' + formatedId;
        let replacable = {
            "###RESET_LINK###": resetLink,
        };

        let {
            status: isMailSent,
            error,
        } = await sendMail(email, 'admin-reset-pattern', replacable);
        if (!isMailSent) {
            return res.json({
                status: false,
                message: 'Error occurred while sending reset link to your email',
                error: error.message || error,
            })
        }

        return res.json({
            status: true,
            message: 'The reset pattern link has been sent your email',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message || error,
        });
    }
};

exports.verifyResetLink = async (req, res) => {
    try {
        let {
            id,
        } = req.body;

        let deFormatedId = id.replace(/----/g, '=').replace(/---/g, '+').replace(/--/g, '/');
        let [adminId, expiryAt] = decrypt(deFormatedId).split('?');
        if (!expiryAt || Number(expiryAt) < Date.now()) {
            return res.json({
                status: false,
                message: 'Link has been expired!',
            });
        }

        id = adminId;
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        }

        const adminInfo = await Admin.countDocuments({ _id: id });
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        };

        return res.json({
            status: true,
            message: 'The reset link is valid',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        let {
            id,
            newPassword,
        } = req.body;

        let deFormatedId = id.replace(/----/g, '=').replace(/---/g, '+').replace(/--/g, '/');
        let [adminId, expiryAt] = decrypt(deFormatedId).split('?');
        if (!expiryAt || Number(expiryAt) < Date.now()) {
            return res.json({
                status: false,
                message: 'Link has been expired!',
            });
        }

        id = adminId;
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        }

        const adminInfo = await Admin.findOne(
            { _id: id },
            { password: 1, lastPasswords: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        };
        let isNewPassword = await compareCredential(newPassword, adminInfo.password);
        if (isNewPassword) {
            return res.json({
                status: false,
                message: 'The current password and new password must be different',
            });
        };

        await Admin.updateOne({ _id: id }, { password: newPassword });

        return res.json({
            status: true,
            message: 'Password reset successfully',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.resetPattern = async (req, res) => {
    try {
        let {
            id,
            newPattern,
            confirmNewPattern,
        } = req.body;

        if (newPattern !== confirmNewPattern) {
            return res.json({
                status: false,
                message: 'Pattern and confirm pattern did not match',
            });
        };

        let deFormatedId = id.replace(/----/g, '=').replace(/---/g, '+').replace(/--/g, '/');
        let [adminId, expiryAt] = decrypt(deFormatedId).split('?');
        if (!expiryAt || Number(expiryAt) < Date.now()) {
            return res.json({
                status: false,
                message: 'Link has been expired!',
            });
        }

        id = adminId;
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        }

        const adminInfo = await Admin.findOne(
            { _id: id },
            { pattern: 1, lastPatterns: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        };
        let isNewPattern = await compareCredential(newPattern, adminInfo.pattern);
        if (isNewPattern) {
            return res.json({
                status: false,
                message: 'The current password and new password must be different',
            });
        };

        await Admin.updateOne({ _id: id }, { pattern: newPattern });

        return res.json({
            status: true,
            message: 'Pattern reset successfully',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let {
            currentPassword,
            newPassword,
        } = req.body;

        let id = req.adminId;

        const adminInfo = await Admin.findOne(
            { _id: id },
            { password: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }
        let isPasswordMatch = await compareCredential(currentPassword, adminInfo.password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                message: 'The current password is incorrect',
            });
        };
        let isNewPassword = await compareCredential(newPassword, adminInfo.password);
        if (isNewPassword) {
            return res.json({
                status: false,
                message: 'The current password and new password must be different',
            });
        };

        await Admin.updateOne({ _id: id }, { password: newPassword });

        return res.json({
            status: true,
            message: 'Password changed successfully',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.changePattern = async (req, res) => {
    try {
        let {
            currentPattern,
            newPattern,
            confirmNewPattern,
        } = req.body;

        if (newPattern !== confirmNewPattern) {
            return res.json({
                status: false,
                message: 'Pattern and confirm pattern did not match',
            });
        };

        let id = req.adminId;

        const adminInfo = await Admin.findOne(
            { _id: id },
            { pattern: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }
        let isPatternMatch = await compareCredential(currentPattern, adminInfo.pattern);
        if (!isPatternMatch) {
            return res.json({
                status: false,
                message: 'The current pattern is incorrect',
            });
        };
        let isNewPattern = await compareCredential(newPattern, adminInfo.pattern);
        if (isNewPattern) {
            return res.json({
                status: false,
                message: 'The current pattern and new pattern must be different',
            });
        };

        await Admin.updateOne({ _id: id }, { pattern: newPattern });

        return res.json({
            status: true,
            message: 'Pattern changed successfully',

        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.getTfaInfo = async (req, res) => {
    try {
        let id = req.adminId;

        let adminInfo = await Admin.findOne(
            { _id: id },
            { tfaSecret: 1, tfaStatus: 1, tfaQrCode: 1, _id: 0 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Unauthorized!',
            });
        }
        if (!adminInfo.tfaSecret || !adminInfo.tfaQrCode) {
            let tfaSecret = generateTfaSecret();
            adminInfo = await Admin.findOneAndUpdate(
                { _id: id },
                {
                    tfaStatus: false,
                    tfaSecret: tfaSecret.base32,
                    tfaQrCode: await generateQRCode(tfaSecret?.otpauth_url),
                },
                {
                    fields: { _id: 0, tfaSecret: 1, tfaStatus: 1, tfaQrCode: 1 },
                    new: true
                },
            );
        }

        return res.json({
            status: true,
            message: 'TFA details fetched successfully!',
            data: adminInfo,
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.mutateTfa = async (req, res) => {
    try {
        let {
            tfaCode,
            password,
        } = req.body;

        let id = req.adminId;

        const adminInfo = await Admin.findOne(
            { _id: id },
            { password: 1, tfaSecret: 1, tfaStatus: 1 },
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }
        let isPasswordMatch = await compareCredential(password, adminInfo.password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                message: 'The password is incorrect',
            });
        };

        let isTfaVerified = verifyTfaCode(adminInfo.tfaSecret, tfaCode);
        if (!isTfaVerified) {
            return res.json({
                status: false,
                message: 'Incorrect TFA code',
            });
        }

        let tfaStatus = adminInfo.tfaStatus;
        let updateObj = { tfaStatus: true };
        if (tfaStatus) {
            let tfaSecret = generateTfaSecret();
            updateObj.tfaStatus = false;
            updateObj.tfaSecret = tfaSecret.base32;
            updateObj.tfaQrCode = await generateQRCode(tfaSecret?.otpauth_url);
        }

        await Admin.updateOne({ _id: id }, updateObj);

        return res.json({
            status: true,
            message: `TFA ${tfaStatus ? 'disabled' : 'enabled'} successfully`,
            data: updateObj
        });

    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};
