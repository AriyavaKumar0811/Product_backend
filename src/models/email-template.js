const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, VpmWKpZxgCvFtUJ } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(VpmWKpZxgCvFtUJ);

const schemaDefinition = {

    name: { type: String, default: '' },
    subject: { type: String, default: '' },
    template: { type: String, default: '' },
    language: { type: String, default: '' },
    status: { type: Boolean, default: true },

};

const emailTemplateSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, emailTemplateSchema, collectionName);