const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, BgKdrqocklEUfjb } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(BgKdrqocklEUfjb);

const schemaDefinition = {

    email: { type: String, index: 1 },
    ip: { type: String, index: 2 },
    location: { type: String, index: 3 },
    os: { type: String },
    browser: { type: String },
    status: { type: Boolean },

};

const adminHistorySchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);


module.exports = model(collectionName, adminHistorySchema, collectionName);