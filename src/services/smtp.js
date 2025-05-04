
const { createTransport } = require('nodemailer');
const ENV = require('../config');
const { decrypt } = require('./common');

const { SiteSettings, EmailTemplate } = require('../models');

const configOptions = {
    host: decrypt(ENV.SMTP_HOST),
    port: decrypt(ENV.SMTP_PORT),
    auth: {
        user: decrypt(ENV.SMTP_USER),
        pass: decrypt(ENV.SMTP_PASS)
    }
};

exports.sendMail = async (to, template, replacable) => {
    try {
        let settings = await SiteSettings.findOne({});
        let templateData = await EmailTemplate.findOne({ name: template });
        let newSubject = templateData.subject;
        let newTemplate = templateData.template;
        let defaultReplacables = {};
        defaultReplacables['###COPYRIGHTS###'] = settings.copyrights;
        defaultReplacables['###SITE_LOGO###'] = settings.logo;
        defaultReplacables['###INSTAGRAM_URL###'] = settings.instagramUrl;
        defaultReplacables['###X_URL###'] = settings.xUrl;
        defaultReplacables['###FACEBOOK_URL###'] = settings.facebookUrl;

        for (let defaultReplace in defaultReplacables) {
            let re = new RegExp(defaultReplace, 'g');
            newTemplate = newTemplate.replace(re, defaultReplacables[defaultReplace]);
        }

        for (let replace in replacable) {
            let re = new RegExp(replace, 'g');
            newTemplate = newTemplate.replace(re, replacable[replace]);
        }

        for (let replace in replacable) {
            let re = new RegExp(replace, 'g');
            newSubject = newSubject.replace(re, replacable[replace]);
        }

        let transporter = createTransport(configOptions);

        let mailOptions = {
            from: decrypt(ENV.SMTP_EMAIL),
            to: to,
            bcc: '',
            subject: newSubject,
            html: newTemplate
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(new Error(error));
                }

                resolve({ status: true, result: info });
            });
        });
    } catch (err) {
        console.error(err);
        return {
            status: false,
            error: err.message,
        }
    }
};
