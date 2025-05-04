
const { validate } = require('express-validation');

const { verifyAuthToken } = require('../../middlewares/auth');
const router = require('express').Router();
const validations = require('../../validations/admin/admin.validation');
const adminController = require('../../controllers/admin/admin.controller');


router.get('/getCurrentTime',
    // verifyAuthToken,
    adminController.getCurrentTime
);

router.get('/site-settings',
    verifyAuthToken,
    adminController.getSiteSettings
);

router.put('/site-settings',
    verifyAuthToken,
    validate(validations.updateSiteSettings),
    adminController.updateSiteSettings
);

router.get('/login-history',
    verifyAuthToken,
    validate(validations.listApiParams),
    adminController.getAdminLoginHistory
);

router.get('/profile',
    verifyAuthToken,
    adminController.getAdminProfile
);

router.put('/profile',
    verifyAuthToken,
    validate(validations.updateAdminProfile),
    adminController.updateAdminProfile
);

router.get('/ip',
    verifyAuthToken,
    validate(validations.getIps),
    adminController.getIps
);

router.post('/ip',
    verifyAuthToken,
    validate(validations.addIp),
    adminController.addIp
);

router.delete('/ip/:id',
    verifyAuthToken,
    validate(validations.validateIdInParams),
    adminController.deleteIpById
);

router.post('/upload-image', adminController.uploadImage);

module.exports = router;