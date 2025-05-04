const Joi = require('joi');

const listApiParamsFields = {
    page: Joi.number().integer().min(1).label('Page number'),
    size: Joi.number().integer().min(1).label('Page size'),
    sortField: Joi.string().allow('').label('Sort field'),
    sortOrder: Joi.string().valid('asc', 'desc').label('Sort order'),
    search: Joi.string().allow('').label('Search'),
};

module.exports = {
    listApiParamsFields,

    transaction: {
        body: Joi.object({
            userId: Joi.string().required().label('User ID'),
            address: Joi.string().required().label('Address'),
            currency: Joi.string().required().label('Currency'),
            amount: Joi.number().required().label('Amount'),
            txnHash: Joi.string().required().label('Transaction Hash'),
        })
    }
};
