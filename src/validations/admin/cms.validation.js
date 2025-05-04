const Joi = require('joi');

module.exports = {

    'validateIdInParams': {
        params: Joi.object({
            id: Joi.string().required().label('ID'),
        })
    },

    'createFaq': {
        body: Joi.object({
            question: Joi.string().required().label('Question'),
            answer: Joi.string().required().label('Answer'),
        })
    },

    'updateFaq': {
        params: Joi.object({
            id: Joi.string().required().label('ID'),
        }),
        body: Joi.object({
            question: Joi.string().label('Question'),
            answer: Joi.string().label('Answer'),
            status: Joi.boolean().label('status'),
        })
    },

    'updateCms': {
        params: Joi.object({
            id: Joi.string().required().label('ID'),
        }),
        body: Joi.object({
            heading: Joi.string().label('Heading'),
            content: Joi.string().label('Content'),
            image: Joi.boolean().label('status'),
        })
    },
};