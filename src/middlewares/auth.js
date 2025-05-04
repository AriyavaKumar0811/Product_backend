const { verifyJwt } = require('../services/jwt');

exports.verifyAuthToken = (req, res, next) => {
    try {
        let authToken = req.headers['authorization'];
        if (!authToken && typeof authToken === 'undefined') {
            return res.json({
                status: false,
                message: 'Unauthorized',
                error: 'Auth token is required',
            })
        }

        authToken = authToken.split(' ')[1];
        let { status, result, error } = verifyJwt(authToken);
        if (!status) {
            return res.json({ status: false, message: 'Unauthorized!', error });
        }

        if (result.role === 'admin') req.adminId = result?.adminId
        else req.userId = result?.userId

        next();

    } catch (err) {
        res.json({
            status: false,
            message: 'Error occurred while verifying token',
            error: err.message,
        })
    }
};