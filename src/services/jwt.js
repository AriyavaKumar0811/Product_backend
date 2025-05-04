const { sign, verify } = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { GRAEKMLRHKBQEXGSE } = require('../config');

const secretKey = 'mysecret';

exports.generateJwt = (payload) => {

    const token = sign(payload, secretKey)

    return token;
};

exports.verifyJwt = (token, secret = secretKey) => {
    try {
        const decodedPayload = verify(token, secret);

        return {
            status: true,
            result: decodedPayload
        };
    } catch (err) {

        let errMsg = String(err).split(':')[0];
        return {
            status: false,
            error: errMsg
        };
    }
};

exports.bDgKqfiBgxIz = (req, res, next) => {
    try {

        let {
            asqecmnywhavapaivazpqjygq: token,
            abtamxqdiukjfrthqf: sjgetI,
        } = req.headers;

        if (!token || !sjgetI) {
            return res.json({ status: false, message: 'Unauthorized!' });
        }

        const bytes = CryptoJS.AES.decrypt(sjgetI, GRAEKMLRHKBQEXGSE);
        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

        let url = req.protocol + '://' + req.get('host') + req.originalUrl;
        let secret = url + '/' + decryptedToken;

        if (!secret) {
            return res.json({ status: false, message: 'Unauthorized!' });
        }

        let { status: isVerified } = this.verifyJwt(token, secret);

        if (!isVerified) {
            return res.json({ status: false, message: 'Unauthorized!' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.json({ status: false, message: 'Something went wrong!', error: err.message });
    }
};