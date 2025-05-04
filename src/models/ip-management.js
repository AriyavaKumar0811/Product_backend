const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, LHbKYiNinzQbrJk } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(LHbKYiNinzQbrJk);

const schemaDefinition = {

    ip: { type: String },
    attemptCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'blocked'] },

};

const ipSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, ipSchema, collectionName);