const { IP2Proxy } = require('ip2proxy-nodejs');
const { getIpAddress } = require('./common');
const ip2proxy = new IP2Proxy();

const vpnValidator = (req, res, next) => {
    try {
        if (ip2proxy.open('./ZNpBmtZzj6UO1cWq3E.BIN') !== 0) {
            return res.json({ status: false, message: 'Error occured!!' });
        }

        let ip = getIpAddress(req);
        let isProxy = ip2proxy.isProxy(ip);

        if (isProxy !== 0 && isProxy !== 1) {
            return res.json({
                status: 404,
                message: 'The VPN connection is not allowed!'
            });
        }

        next();

        ip2proxy.close();

    } catch (error) {
        res.json({ status: false, message: 'Error occurs!!', error: error.message });
    }
};

module.exports = vpnValidator;