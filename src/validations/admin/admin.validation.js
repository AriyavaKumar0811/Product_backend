const Joi = require('joi');

const listApiParamsFields = {
    page: Joi.number().label('Page number'),
    size: Joi.number().label('Page size'),
    sortField: Joi.string().allow('').label('Sort field'),
    sortOrder: Joi.string().allow('asc', 'desc').label('Sort order'),
    search: Joi.string().allow('').label('Search'),
};

module.exports = {

    'updateSiteSettings': {
        body: Joi.object({
            name: Joi.string().required().label('Site name'),
            email: Joi.string().required().label('Site email'),
            logo: Joi.string().label('Logo'),
            favicon: Joi.string().label('Favicon'),
            xUrl: Joi.string().required().label('X URL'),
            telegramUrl: Joi.string().required().label('Telegram URL'),
            facebookUrl: Joi.string().required().label('Facebook URL'),
            instagramUrl: Joi.string().required().label('Instagram URL'),
            copyrights: Joi.string().required().label('Copyrights'),
            isMaintenance: Joi.boolean().required().label('Maintenance status'),
        })
    },

    'listApiParams': {
        query: Joi.object({
            ...listApiParamsFields
        })
    },

    'getIps': {
        query: Joi.object({
            type: Joi.string().required().valid('blocked', 'whitelisted').label('Type'),
            ...listApiParamsFields
        })
    },

    'updateAdminProfile': {
        query: Joi.object({
            name: Joi.string().label('Name'),
            email: Joi.string().label('Email'),
            profile: Joi.string().label('Profile image'),
        })
    },

    'validateIdInParams': {
        params: Joi.object({
            id: Joi.string().required().label('ID'),
        })
    },

    'addIp': {
        body: Joi.object({
            ip: Joi.string().required().label('IP address'),
            action: Joi.string().required().valid('block', 'whitelist').label('Action name'),
        })
    },

};