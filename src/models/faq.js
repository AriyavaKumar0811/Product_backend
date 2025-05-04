const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, GafwiTQLvamtEIV } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(GafwiTQLvamtEIV);

const schemaDefinition = {

    category: { type: String, index: 1 },
    question: { type: String, index: 2 },
    answer: { type: String },
    status: { type: Boolean, default: true, index: 3 },

};

const faqSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, faqSchema, collectionName);