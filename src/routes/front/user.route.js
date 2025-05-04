
const router = require('express').Router();
const { validate } = require('express-validation');

const {
    loginStatusSchema,
    mutateWalletStatusSchema,
    userRegisterSchema,
    userLoginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyResetLinkSchema
} = require('../../validations/front/user.validation');
const {
    loginStatus,
    connectWallet,
    walletLogout,
    userRegister,
    userLogin,
    forgotPassword,
    resetPassword,
    verifyResetLink,
} = require('../../controllers/front/user.controller');
const { verifyAuthToken } = require('../../middlewares/auth');

router.get('/login-status',
    validate(loginStatusSchema),
    loginStatus
);

router.post('/connect-wallet',
    validate(mutateWalletStatusSchema),
    verifyAuthToken,
    connectWallet
);

router.post('/logout',
    validate(mutateWalletStatusSchema),
    walletLogout
);

router.post('/register',
    validate(userRegisterSchema),
    userRegister
);

router.post('/login',
    validate(userLoginSchema),
    userLogin
);

router.post('/forgot-password',
    validate(forgotPasswordSchema),
    forgotPassword
);

router.put('/reset-password',
    validate(resetPasswordSchema),
    resetPassword
);

router.post('/verify-reset-link',
    validate(verifyResetLinkSchema), 
    verifyResetLink
);

module.exports = router;