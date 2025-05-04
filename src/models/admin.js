const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const { decrypt } = require('../services/common');
const { ZbtOdIYSIzuTmhQ, KuWbLpZvXdLolbe } = require('../config/SfHnxZqGjz');
console.log("🍟 ZbtOdIYSIzuTmhQ", ZbtOdIYSIzuTmhQ);

const collectionName = decrypt(ZbtOdIYSIzuTmhQ) + decrypt(KuWbLpZvXdLolbe);
console.log("🐴 collectionName", collectionName);

const schemaDefinition = {

    name: { type: String, default: '' },
    email: { type: String, required: true, index: 1 },
    password: { type: String, required: true, index: 2 },
    pattern: { type: String, required: true, index: 3 },
    profile: { type: String, default: '' },
    tfaSecret: { type: String },
    tfaQrCode: { type: String },
    tfaStatus: { type: Boolean, default: false },
    status: { type: Boolean },

};

const adminSchema = new Schema(
    schemaDefinition,
    {
        timestamps: true,
        versionKey: false,
    }
);

adminSchema.pre('save', async function (next) {

    const admin = this;
    if (admin.isModified('password')) {
        admin.password = bcrypt.hashSync(admin.password, 8);
    }
    if (admin.isModified('pattern')) {
        admin.pattern = bcrypt.hashSync(admin.pattern, 8);
    }
    next();
});

adminSchema.pre('updateOne', async function (next) {
    let data = this.getUpdate();
    if (data.password) {
        data.password = bcrypt.hashSync(data.password, 8);
    }
    if (data.pattern) {
        data.pattern = bcrypt.hashSync(data.pattern, 8);
    }
    next();
});

/**
 * Check if password matches the admin's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
adminSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

module.exports = model(collectionName, adminSchema, collectionName);