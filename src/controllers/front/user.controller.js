const { Users } = require('../../models');
const { SITE_URL } = require('../../config');
const { scheduleTrackUserAgenda, cancelTrackUserAgenda } = require('../../services/agenda');
const { compareCredential, encrypt, decrypt, isValidObjectId, } = require('../../services/common');
const { sendMail } = require('../../services/smtp');
const { generateJwt } = require('../../services/jwt');

exports.loginStatus = async (req, res) => {
    try {

        const { address } = req.query;
        const user = await Users.findOne({ address }, { _id: 0, address: 1, isLoggedIn: 1 });
        if (!user) return res.json({ status: false, message: 'User not found' });
        res.json({ status: true, message: 'Login status get successfully!! #VnfJfbVKPFBut7DcekFK#', data: user });

    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'An error occurred', error: error.message });
    }
};

exports.connectWallet = async (req, res) => {
    try {

        const userId = req.userId;
        console.log("________________________  exports.connectWal  userId:", userId)
        const { address } = req.body;
        console.log("________________________  exports.connectWal  address:", address)
        const user = await Users.findOne({ _id: userId }, { _id: 0, address: 1, isLoggedIn: 1 });
        if (!user) {
            return res.json({ status: false, message: 'Unauthorized', });

        }
        if (user.address && user.address !== address) {
            return res.json({ status: false, message: 'Connect the wallet by using #VnonfVMKPFBmn7DceiK# the registered wallet address', });
        }
        if (!user.address) {
            let isExistAddress = await Users.countDocuments({ address });
            if (isExistAddress) {
                return res.json({
                    status: false,
                    message: 'The wallet address has been connected with another account. Try again with new account',
                });
            }

            await Users.updateOne({ _id: userId }, { address });
        }

        res.json({
            status: true,
            message: 'Wallet connected successfully',
        });
    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'An error occurred', error: error.message });
    }
};

exports.walletLogout = async (req, res) => {
    try {

        const { address } = req.body;
        await Users.updateOne(
            { address },
            { isLoggedIn: false, trackStatus: false, trackStatusCount: 0 }
        );

        await cancelTrackUserAgenda(address);

        res.json({ status: true, message: 'Logout Successfully!' });

    } catch (error) {
        console.error(error);
        res.json({ status: false, message: 'An error occurred', error: error.message });
    }
};


exports.userRegister = async (req, res) => {
    try {
        let {
            email,
            password,
            country,
        } = req.body;

        const isExistEmail = await Users.countDocuments({ email });
        if (isExistEmail) {
            return res.json({
                status: false,
                message: 'Email already exists',
            });
        }

        await Users.create({
            email,
            password,
            country,
        })

        return res.json({
            status: true,
            message: 'Registered successfully',
        });

    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Registration failed!',
            error: error.message,
        });
    }
};


exports.userLogin = async (req, res) => {
    try {
        let {
            email,
            password,
        } = req.body;

        const user = await Users.findOne({ email }, { email: 1, password: 1, isLoggedIn: 1 });
        if (!user) {
            return res.json({
                status: false,
                message: 'Email not found!',
            });
        }

        let isPasswordMatch = await compareCredential(password, user.password);
        if (!isPasswordMatch) {
            return res.json({
                status: false,
                message: 'Invalid credentials',
            });
        }

        // if (user.isLoggedIn) {
        //     return res.json({
        //         status: false,
        //         message: 'You have logged in to another device. Please log out of that device and try again after 5 minutes.',
        //     });

        // }

        let expiryAt = Math.floor(Date.now() / 1000) + 60 * 60;
        let userId = user._id.toString();
        let authToken = generateJwt({
            userId,
            role: 'user',
            exp: expiryAt,
        });

        await Users.findOneAndUpdate({ email }, { isLoggedIn: true, trackStatus: true });
        await scheduleTrackUserAgenda(userId);

        return res.json({
            status: true,
            message: 'Login success!',
            data: {
                authToken
            }
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

exports.forgotPassword = async (req, res) => {
    try {
        let {
            email,
        } = req.body;

        const user = await Users.findOne(
            { email },
            { _id: 1 },
        );
        if (!user) {
            return res.json({
                status: false,
                message: 'Email not found',
            });
        }

        let encryptedId = encrypt(user._id.toString() + '?' + (Date.now() + 600000).toString());
        let formatedId = encryptedId.toString().replace(/\//g, '--').replace(/=/g, '----').replace(/\+/g, '---');
        let resetLink = SITE_URL + 'reset-password/' + formatedId;
        let replacable = {
            "###RESET_LINK###": resetLink,
        };

        let {
            status: isMailSent,
            error,
        } = await sendMail(email, 'user-reset-password', replacable);
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

exports.verifyResetLink = async (req, res) => {
    try {
        let {
            id,
        } = req.body;

        let deFormatedId = id.replace(/----/g, '=').replace(/---/g, '+').replace(/--/g, '/');
        let [userId, expiryAt] = decrypt(deFormatedId).split('?');
        if (!expiryAt || Number(expiryAt) < Date.now()) {
            return res.json({
                status: false,
                message: 'Link has been expired!',
            });
        }

        id = userId;
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        }

        const user = await Users.countDocuments({ _id: id });
        if (!user) {
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
        let [userId, expiryAt] = decrypt(deFormatedId).split('?');
        if (!expiryAt || Number(expiryAt) < Date.now()) {
            return res.json({
                status: false,
                message: 'Link has been expired!',
            });
        }

        id = userId;
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        }
        const user = await Users.findOne(
            { _id: id },
            { password: 1, lastPasswords: 1 },
        );
        if (!user) {
            return res.json({
                status: false,
                message: 'Invalid reset link',
            });
        };
        let isNewPassword = await compareCredential(newPassword, user.password);
        if (isNewPassword) {
            return res.json({
                status: false,
                message: 'The current password and new password must be different',
            });
        };

        await Users.updateOne({ _id: id }, { password: newPassword });

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
