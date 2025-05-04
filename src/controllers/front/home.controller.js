const { Cms, Faq, SiteSettings } = require("../../models");

exports.getHomeContents = async (_req, res) => {
    try {

        let homeContents = await Cms.find({}, { _id: 0, title: 1, heading: 1, content: 1, image: 1 });

        homeContents = homeContents.reduce((acc, cur) => {
            if (acc[cur.title]) {
                acc[cur.title].push(cur);
            } else {
                acc[cur.title] = [cur];
            }

            return acc;
        }, {});

        res.json({
            status: true,
            message: 'Success',
            data: homeContents
        })
    } catch (err) {
        console.error(err);
        res.json({
            status: false,
            message: 'Error occurred!',
            error: err.message,
        });
    }
};

exports.getFaqs = async (_req, res) => {
    try {

        let faqs = await Faq.find(
            { status: true },
            { _id: 0, question: 1, answer: 1 }
        );

        res.json({
            status: true,
            message: 'Success',
            data: faqs
        })
    } catch (err) {
        console.error(err);
        res.json({
            status: false,
            message: 'Error occurred!',
            error: err.message,
        });
    }
};

exports.getSocialMedia = async (_req, res) => {
    try {

        let settings = await SiteSettings.findOne(
            {},
            {
                _id: 0,
                xUrl: 1,
                logo: 1,
                favicon: 1,
                copyrights: 1,
                telegramUrl: 1,
                facebookUrl: 1,
                instagramUrl: 1,
            }
        );

        res.json({
            status: true,
            message: 'Success',
            data: settings
        })
    } catch (err) {
        console.error(err);
        res.json({
            status: false,
            message: 'Error occurred!',
            error: err.message,
        });
    }
};