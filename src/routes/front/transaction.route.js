
const router = require('express').Router();
const { validate } = require('express-validation');

const {
    loginStatusSchema,
    mutateWalletStatusSchema,
} = require('../../validations/front');
const {
    loginStatus,
} = require('../../controllers/front/transaction.controller4');
const { verifyAuthToken } = require('../../middlewares/auth');

router.post('/transaction',
    validate(loginStatusSchema),
    loginStatus
);
