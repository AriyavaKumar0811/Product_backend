
const router = require('express').Router();

const { getHomeContents, getFaqs, getSocialMedia } = require('../../controllers/front/home.controller');

router.get(
    '/home-contents', 
    getHomeContents,
);

router.get(
    '/faq', 
    getFaqs,
);

router.get(
    '/social-media', 
    getSocialMedia,
);

module.exports = router;