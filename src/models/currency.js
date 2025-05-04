const { Schema, model } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, GynNGmFVgOxJxoz } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(GynNGmFVgOxJxoz);

const schemaDefinition = {

    id: { type: String, default: '' },
    type: { type: String, default: '' },
    name: { type: String, default: '' },
    address: { type: String, default: '' },
    network: { type: String, default: '' },
    symbol: { type: String, default: '' },
    decimals: { type: Number, default: 0 },
    usdPrice: { type: Number, default: 0 },
    coingeckoId: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    gtScore: { type: Number, default: '' },
    status: { type: Boolean, default: false },

};

const tokenSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = model(collectionName, tokenSchema, collectionName);