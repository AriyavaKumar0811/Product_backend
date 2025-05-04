const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, FbRhaGrBfAPMPjP } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(FbRhaGrBfAPMPjP);

const schemaDefinition = {

    title: { type: String, default: '' },
    heading: { type: String, default: '' },
    content: { type: String, default: '' },
    image: { type: String },
    status: { type: Boolean, default: true },

};

const cmsSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, cmsSchema, collectionName);