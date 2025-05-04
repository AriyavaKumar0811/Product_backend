const { validate } = require('express-validation');

const { verifyAuthToken } = require('../../middlewares/auth');
const router = require('express').Router();
const validations = require('../../validations/admin/auth.validation');
const authController = require('../../controllers/admin/auth.controller');

router.post('/ip-whitelist/:authCode',
    validate(validations.ipWhitelist),
    authController.ipWhitelist
);

router.get('/check-ip',
    authController.checkIp
);

router.post('/login',
    validate(validations.adminLogin),
    authController.adminLogin
);

router.post('/verify-tfa',
    validate(validations.verifyTfa),
    authController.verifyTfa
);

router.post('/forgot-password',
    validate(validations.forgotPassword),
    authController.forgotPassword
);

router.post('/forgot-pattern',
    validate(validations.forgotPattern),
    authController.forgotPattern
);

router.post('/verify-reset-link',
    validate(validations.verifyResetLink),
    authController.verifyResetLink
);

router.put('/reset-password',
    validate(validations.resetPassword),
    authController.resetPassword
);

router.put('/reset-Pattern',
    validate(validations.resetPattern),
    authController.resetPattern
);

router.put('/change-password',
    verifyAuthToken,
    validate(validations.changePassword),
    authController.changePassword
);

router.put('/change-pattern',
    verifyAuthToken,
    validate(validations.changePattern),
    authController.changePattern
);

router.get('/tfa',
    verifyAuthToken,
    authController.getTfaInfo
);

router.put('/mutate-tfa',
    verifyAuthToken,
    validate(validations.mutateTfa),
    authController.mutateTfa
);


module.exports = router;