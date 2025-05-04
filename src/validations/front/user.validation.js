const Joi = require('joi');

const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,30}$/;

module.exports = {

    // GET /api/v1/user/login-status
    'loginStatusSchema': {
        query: Joi.object({
            address: Joi.string().required().label('User address'),
        })
    },

    // GET /api/v1/user/connect-wallet && GET /api/v1/user/logout
    'mutateWalletStatusSchema': {
        body: Joi.object({
            address: Joi.string().required().label('User address'),
            type: Joi.string().label('Type'),
        })
    },

    'userRegisterSchema': {
        body: Joi.object({
            email: Joi.string().required().email().label('Email'),
            password: Joi.string().required()
                .min(8)
                .pattern(passwordRegExp)
                .label('Password')
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
                    'string.max': 'Password must not exceed 30 characters.'
                }),
            confirmPassword: Joi.string().required()
                .valid(Joi.ref('password')) // Ensure confirmPassword matches Password
                .required()
                .messages({
                    'any.only': 'Password and confirmation password must be the same.',
                })
                .label('Confirm password'),
            country: Joi.string().required().label('Country'),
        })
    },

    'userLoginSchema': {
        body: Joi.object({
            email: Joi.string().required().email().label('Email'),
            password: Joi.string().required().label('Password'),
        })
    },

    'forgotPasswordSchema': {
        body: Joi.object({
            email: Joi.string().required().email().label('Email'),
        })
    },

    'resetPasswordSchema': {
        body: Joi.object({
            id: Joi.string().required().label('ID'),
            newPassword: Joi.string().required()
                .pattern(passwordRegExp)
                .label('New password')
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
                    'string.max': 'Password must not exceed 30 characters.'
                }),
            confirmNewPassword: Joi.string().required()
                .valid(Joi.ref('newPassword')) // Ensure confirmPassword matches newPassword
                .required()
                .messages({
                    'any.only': 'Confirmation password must match the new password.',
                })
                .label('Confirm new password'),
        })
    },

    'verifyResetLinkSchema': {
        body: Joi.object({
            id: Joi.string().required().label('ID'),
        })
    },

};