const { SiteSettings, AdminHistory, Admin, IpManagement } = require('../../models');
const { uploadAssetInS3 } = require('../../services/common');
const { emitMessage } = require('../../services/socket');

// Admin.create({
//     email: "demo@apmtechnologies.in",
//     password: "Demo@123",
//     pattern: "12369",
// })

exports.getCurrentTime = async (_req, res) => {
    try {
        const currentTime = new Date(); // Gets the current server time
        return res.json({
            status: true,
            message: "Current server time retrieved successfully",
            data: currentTime
        });
    } catch (error) {
        console.log("🍋 error", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching the time",
            data: null
        });
    }
};


exports.getSiteSettings = async (_req, res) => {
    try {

        let siteSettings = await SiteSettings.findOne(
            {},
            {
                _id: 0,
                name: 1,
                logo: 1,
                xUrl: 1,
                email: 1,
                favicon: 1,
                copyrights: 1,
                facebookUrl: 1,
                telegramUrl: 1,
                instagramUrl: 1,
                isMaintenance: 1,
            }
        );

        return res.json({
            status: true,
            message: `Site settings fetched successfully`,
            data: siteSettings
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

exports.updateSiteSettings = async (req, res) => {
    console.log("🦊 res", res);
    console.log("🥑 req", req);

    try {

        let reqData = req.body;
        console.log("🌭 reqData", reqData);

        let { logo, favicon } = req.files || {};

        let updateObj = { ...reqData };
        if (logo) {
            let {
                status: isSuccess,
                result: imgRes,
                error,
            } = await uploadAssetInS3(logo);
            if (!isSuccess) {
                return res.json({
                    status: false,
                    message: imgRes,
                    error
                })
            }

            updateObj.logo = imgRes;
        }
        if (favicon) {
            let {
                status: isSuccess,
                result: imgRes,
                error,
            } = await uploadAssetInS3(favicon);
            if (!isSuccess) {
                return res.json({
                    status: false,
                    message: imgRes,
                    error
                })
            }

            updateObj.favicon = imgRes;
        }

        await SiteSettings.updateOne({}, updateObj);

        return res.json({
            status: true,
            message: `Site settings updated successfully`,
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

exports.getAdminLoginHistory = async (req, res) => {
    try {

        let { page, size, sortOrder, sortField, search } = req.query;

        let limit = size ? parseInt(size) : 10;
        let skip = page ? parseInt(page) * limit : 0;
        let query = {};
        let projection = {};
        let sortQuery = {};
        if (sortOrder && sortField) {
            sortQuery[sortField] = sortOrder === 'desc' ? 1 : -1;
        }
        if (search) {
            search = new RegExp(search, 'i');
            query['$or'] = [
                { os: search },
                { location: search },
                { browser: search },
                { email: search },
            ]
        }

        projection = {
            ip: 1,
            os: 1,
            browser: 1,
            location: 1,
            email: 1,
            createdAt: 1,
        }
        let logHistoryCount = await AdminHistory.countDocuments(query);
        if (!logHistoryCount) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        let logHistory = await AdminHistory
            .find(query, projection)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery)

        return res.json({
            status: true,
            message: 'Success',
            count: logHistoryCount,
            data: logHistory,
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

exports.uploadImage = async (req, res) => {
    try {

        let { image } = req.files;
        if (!image) {
            return res.json({
                status: false,
                message: 'Image is required',
            });
        };

        let { status: isSuccess, result: imageRes, error } = await uploadAssetInS3(image);
        if (!isSuccess) {
            return res.json({
                status: false,
                message: imageRes,
                error
            });
        };

        res.json({
            status: true,
            message: 'Image uploaded successfully',
            data: imageRes
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

exports.getAdminProfile = async (req, res) => {
    console.log("🚨 res", res);
    console.log("🐿️ req", req);

    try {

        let id = req.adminId;
        console.log("🧅 id", id);

        if (!id) {
            return res.json({
                status: false,
                message: 'Unauthorized!',
            });
        }

        let adminInfo = await Admin.findOne(
            { _id: id },
            { name: 1, email: 1, profile: 1 }
        );
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Unauthorized!',
            });
        }

        return res.json({
            status: true,
            message: 'Success',
            data: adminInfo
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

exports.updateAdminProfile = async (req, res) => {
    try {

        let id = req.adminId;
        let { profile } = req.files || {};
        let { name, email } = req.body;
        if (!id) {
            return res.json({
                status: false,
                message: 'Unauthorized!',
            });
        }

        let adminInfo = await Admin.countDocuments({ _id: id });
        if (!adminInfo) {
            return res.json({
                status: false,
                message: 'Unauthorized!',
            });
        }
        let updateObj = { name, email, };
        if (profile) {
            let {
                status: isSuccess,
                result: imgRes,
                error,
            } = await uploadAssetInS3(profile);
            if (!isSuccess) {
                return res.json({
                    status: false,
                    message: result,
                    error
                })
            }

            updateObj.profile = imgRes;
        }

        await Admin.updateOne({ _id: id }, updateObj);

        return res.json({
            status: true,
            message: 'Profile updated successfully',
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

exports.addIp = async (req, res) => {
    try {

        let { ip, action } = req.body;

        let status, message;
        if (action === 'block') {
            status = 'blocked';
            message = 'blocked';
        } else {
            status = 'active';
            message = 'whitelisted';
        }

        let isExistIp = await IpManagement.findOne({ ip }, { ip: 1, status: 1 });
        if (isExistIp) {
            if (isExistIp.status === status) return res.json({
                status: false,
                message: `IP already ${message}!`,
            });
            await IpManagement.updateOne({ ip }, { status });
        } else {
            await IpManagement.create({ ip, status });
        }

        emitMessage('ip-actions', true);

        return res.json({
            status: true,
            message: `IP ${message} successfully`,
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

exports.getIps = async (req, res) => {
    try {

        let { type, page, size, sortOrder, sortField, search } = req.query;

        let limit = size ? parseInt(size) : 10;
        let skip = page ? parseInt(page) * limit : 0;
        let query = {};
        let projection = {};
        let sortQuery = {};
        if (sortOrder && sortField) {
            sortQuery[sortField] = sortOrder === 'desc' ? 1 : -1;
        }
        if (search) {
            search = new RegExp(search, 'i');
            query.ip = search;
        }

        query.status = type === 'blocked' ? 'blocked' : 'active';

        projection = {
            ip: 1,
            status: 1,
            createdAt: 1
        }
        let ipCount = await IpManagement.countDocuments(query);
        if (!ipCount) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        let ips = await IpManagement
            .find(query, projection)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery)

        return res.json({
            status: true,
            message: 'Success',
            count: ipCount,
            data: ips,
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

exports.deleteIpById = async (req, res) => {
    try {

        let { id } = req.params;

        let ipInfo = await IpManagement.countDocuments({ _id: id });
        if (!ipInfo) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        await IpManagement.deleteOne({ _id: id });

        return res.json({
            status: true,
            message: 'Deleted successfully',
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


exports.getDashboardWidget = async (_req, res) => {
    try {
        const now = moment();

        // Time ranges
        const startOfToday = now.clone().startOf('day').toDate();
        const startOfWeek = now.clone().startOf('week').toDate();
        const startOfMonth = now.clone().startOf('month').toDate();

        const [activeUsers, blockedUsers, dailyUsers, weeklyUsers, monthlyUsers] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isBlocked: true }),
            User.countDocuments({ createdAt: { $gte: startOfToday } }),
            User.countDocuments({ createdAt: { $gte: startOfWeek } }),
            User.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        return res.json({
            status: true,
            message: "Dashboard data retrieved successfully",
            data: {
                activeUsers,
                blockedUsers,
                dailyUsers,
                weeklyUsers,
                monthlyUsers
            }
        });
    } catch (error) {
        console.log("🍋 error", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching dashboard data",
            data: null
        });
    }
};
