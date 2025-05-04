const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, POxRWHpUWQNOfsF } = require('../config/SfHnxZqGjz');
const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(POxRWHpUWQNOfsF);

const schemaDefinition = {

    address: { type: String, index: 1, default: '' },
    email: { type: String, index: 2, required: true },
    password: { type: String, index: 3, required: true },
    country: { type: String, index: 4, required: true },
    isEmailVerified: { type: Boolean, default: false },
    userStatus: { type: String },
    isLoggedIn: { type: Boolean },
    trackStatus: { type: Boolean, default: false },
    trackStatusCount: { type: Number, default: 0 },


};

const userSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.pre('save', async function (next) {

    const user = this;
    if (user.isModified('password')) {
        user.password = bcrypt.hashSync(user.password, 8);
    }

    next();
});

userSchema.pre('updateOne', async function (next) {
    let data = this.getUpdate();
    if (data.password) {
        data.password = bcrypt.hashSync(data.password, 8);
    }

    next();
});

module.exports = model(collectionName, userSchema, collectionName);