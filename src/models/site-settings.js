const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, TOyhqCkhKyRRfMZ } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(TOyhqCkhKyRRfMZ);

const schemaDefinition = {

    name: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    xUrl: { type: String, default: '' },
    telegramUrl: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    copyrights: { type: String, default: '' },
    isMaintenance: { type: Boolean, default: false },

};

const settingsSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, settingsSchema, collectionName);