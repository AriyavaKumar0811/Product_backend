const { Schema, model, Types } = require('mongoose');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, FdoFjJMghwkoOaQ, POxRWHpUWQNOfsF } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(FdoFjJMghwkoOaQ);
const userSchemaName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(POxRWHpUWQNOfsF);

const schemaDefinition = {

    userId: { type: Types.ObjectId, ref: userSchemaName },
    address: { type: String, default: '' },
    currency: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    txnHash: { type: String, default: '' },
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