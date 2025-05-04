
const { validate } = require('express-validation');

const { verifyAuthToken } = require('../../middlewares/auth');
const router = require('express').Router();
const { listApiParams } = require('../../validations/admin/admin.validation');
const validations = require('../../validations/admin/cms.validation.js');
const cmsController = require('../../controllers/admin/cms.controller');

router.get('/faqs',
    verifyAuthToken,
    validate(listApiParams),
    cmsController.getFaqs
);

router.post('/faq',
    verifyAuthToken,
    validate(validations.createFaq),
    cmsController.createFaq
);

router.get('/faq/:id',
    verifyAuthToken,
    validate(validations.validateIdInParams),
    cmsController.getFaqById
);

router.put('/faq/:id',
    verifyAuthToken,
    validate(validations.updateFaq),
    cmsController.updateFaqById
);

router.delete('/faq/:id',
    verifyAuthToken,
    validate(validations.validateIdInParams),
    cmsController.deleteFaqById
);

router.get('/',
    verifyAuthToken,
    validate(listApiParams),
    cmsController.getCms
);

router.get('/:id',
    verifyAuthToken,
    validate(validations.validateIdInParams),
    cmsController.getCmsById
);

router.put('/:id',
    verifyAuthToken,
    validate(validations.updateCms),
    cmsController.updateCmsById
);

module.exports = router;