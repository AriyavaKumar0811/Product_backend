const Joi = require('joi');

const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,30}$/;

module.exports = {

    'ipWhitelist': {
        params: Joi.object({
            authCode: Joi.string().required().label('Auth code'),
        })
    },

    'adminLogin': {
        body: Joi.object({
            email: Joi.string().required().label('Email'),
            password: Joi.string().required().label('Password'),
            pattern: Joi.string().required().label('Pattern'),
        })
    },

    'forgotPassword': {
        body: Joi.object({
            email: Joi.string().required().label('Email'),
        })
    },

    'forgotPattern': {
        body: Joi.object({
            email: Joi.string().required().label('Email'),
        })
    },

    'resetPassword': {
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

    'verifyResetLink': {
        body: Joi.object({
            id: Joi.string().required().label('ID'),
        })
    },

    'resetPattern': {
        body: Joi.object({
            id: Joi.string().required().label('ID'),
            newPattern: Joi.number().required().label('New pattern'),
            confirmNewPattern: Joi.number().required().label('Confirm new pattern'),
        })
    },

    'changePassword': {
        body: Joi.object({
            currentPassword: Joi.string().required().label('Current password'),
            newPassword: Joi.string().required()
                .min(8)
                .max(30)
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

    'changePattern': {
        body: Joi.object({
            currentPattern: Joi.string().required().label('Current pattern'),
            newPattern: Joi.number().required().label('New pattern'),
            confirmNewPattern: Joi.number().required().label('Confirm new pattern'),
        })
    },

    'mutateTfa': {
        body: Joi.object({
            password: Joi.string().required().label('Password'),
            tfaCode: Joi.number().required().label('TFA code'),
        })
    },

    'verifyTfa': {
        body: Joi.object({
            email: Joi.string().required().label('Email'),
            tfaCode: Joi.number().required().label('TFA code'),
        })
    },
};