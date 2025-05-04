const CryptoJs = require('crypto-js');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const geoip = require('geoip-lite');
const useragent = require('express-useragent');
const { S3 } = require("@aws-sdk/client-s3");

const ENV = require('../config');

const key = CryptoJs.enc.Base64.parse(ENV.ENDECRYPT_KEY);
const iv = CryptoJs.enc.Base64.parse(ENV.ENDECRYPT_IV);

let ALLOWED_IMAGE_FORMATS = ['png', 'jpg', 'gif', 'jpeg', 'svg+xml', 'avif'];
const encrypt = (value) => {
    return CryptoJs.AES.encrypt(value, key, { iv }).toString();
};
console.log("ENC:>>", encrypt('mongodb://localhost:27017/test'));

const decrypt = (value) => {

    let decipher = CryptoJs.AES.decrypt(value, key, { iv })
    return decipher.toString(CryptoJs.enc.Utf8);
};
console.log("🍯 decrypt", decrypt('NiwbI26euDTh9TVFTHU9ugeKpGJsw9nNKy+NAfVHZao='));

const compareCredential = async (credential, hash) => {
    let isMatched = await bcrypt.compare(credential, hash)
    return isMatched;
};

const generateTfaSecret = (tfaName, length = 10) => {
    let secret = speakeasy.generateSecret({ name: tfaName ?? ENV.TFA_NAME, length });
    return secret;
}

const generateQRCode = async (otpAuthUrl) => {
    let qrcode = await QRCode.toDataURL(otpAuthUrl);
    return qrcode;
};

const verifyTfaCode = (tfaKey, tfaCode) => {
    let verified = speakeasy.totp.verify({
        secret: tfaKey,
        encoding: 'base32',
        token: tfaCode,
        window: 5
    });
    return verified;
};

const getIpAddress = (request) => {
    let ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: '::ffff:146.xxx.xxx.xxx'
    return ip[0];
};

const isValidObjectId = (id) => {
    const checkForHexRegExp = /^[0-9a-fA-F]{24}$/;

    if (id == null) return false;

    if (typeof id === 'number') {
        return true;
    }

    if (typeof id === 'string') {
        return id.length === 12 || (id.length === 24 && checkForHexRegExp.test(id));
    }

    if (id instanceof ObjectId) {
        return true;
    }

    if (id instanceof Buffer && id.length === 12) {
        return true;
    }

    // Duck-Typing detection of ObjectId like objects
    if (typeof id === 'object' && 'toHexString' in id && typeof id.toHexString === 'function') {
        if (typeof id.id === 'string') {
            return id.id.length === 12;
        }
        return id.toHexString().length === 24 && checkForHexRegExp.test(id.id.toString('hex'));
    }

    return false;
};

const browserAndOsInfo = (reqHeaders) => {

    let agent = useragent.parse(reqHeaders['user-agent']);

    return {
        os: agent.os.toString(),
        browser: agent.browser,
    };
};


const locationInfo = async (ip) => {
    try {
        let url = `http://ip-api.com/json/${ip}`;
        let res = await fetch(url);
        let data = await res.json();
        if (!data) return null;

        let { city, regionName, country } = data;

        return `${city}, ${regionName}, ${country}`;
    } catch (err) {
        console.error(err);
        return null;
    }
};


const s3 = new S3({
    credentials: {
        accessKeyId: decrypt(ENV.S3_ACCESS_KEY),
        secretAccessKey: decrypt(ENV.S3_SECRET_KEY),
    },
    region: 'us-east-1',
    signatureVersion: 'v4',
});

const uploadAssetInS3 = async (file, allowedFormats = ALLOWED_IMAGE_FORMATS) => {
    try {
        if (!file) {
            return {
                status: false,
                result: 'File is required'
            };
        }

        let filePath = file.data;
        let fileName = file.name || file.filename;
        let [fileType, fileFormat] = file.mimetype.split('/');

        if (!allowedFormats.includes(fileFormat)) {
            return {
                status: false,
                result: `The ${fileFormat} ${fileType} are not allowed`
            };
        }

        let uploadParams = {
            Bucket: ENV.S3_BUCKET_NAME,
            Body: filePath,
            Key: fileName,
            ContentType: fileType + fileFormat
        };

        let response = await s3.putObject(uploadParams);
        if (response?.$metadata?.httpStatusCode !== 200) {
            return {
                status: false,
                result: `Image upload failed`
            };
        }

        let imageUrl = `https://${ENV.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

        return {
            status: true,
            result: imageUrl,
        };

    } catch (err) {
        console.error(err);
        return {
            status: false,
            result: 'Image upload failed',
            error: err.message
        }
    }
};

module.exports = {
    encrypt,
    decrypt,
    compareCredential,
    generateTfaSecret,
    generateQRCode,
    verifyTfaCode,
    getIpAddress,
    browserAndOsInfo,
    locationInfo,
    uploadAssetInS3,
    isValidObjectId,
};