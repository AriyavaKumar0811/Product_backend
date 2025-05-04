const { Faq, Cms } = require('../../models');
const { isValidObjectId, uploadAssetInS3 } = require('../../services/common');

exports.createFaq = async (req, res) => {
    try {

        let { question, answer } = req.body;

        let isExistQuestion = await Faq.countDocuments({ question });
        if (isExistQuestion) {
            return res.json({
                status: false,
                message: 'Question already exists!',
            });
        }

        await Faq.create({ question, answer });

        return res.json({
            status: true,
            message: 'FAQ created successfully',
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.getFaqs = async (req, res) => {
    try {

        let { page, size, sortOrder, sortField, search } = req.query;

        let limit = size ? parseInt(size) : 10;
        let skip = page ? parseInt(page) * limit : 0;
        let query = {};
        let projection = {};
        let sortQuery = {};
        if (sortOrder && sortField) {
            sortQuery[sortOrder] = sortField === 'asc' ? 1 : -1;
        }
        if (search) {
            search = new RegExp(search, 'i');
            query['$or'] = [
                { category: search },
                { question: search },
                { answer: search },
            ]
        }

        projection = {
            updatedAt: 0,
        }
        let faqCount = await Faq.countDocuments(query);
        if (!faqCount) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        let faqs = await Faq
            .find(query, projection)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery)

        return res.json({
            status: true,
            message: 'Success',
            count: faqCount,
            data: faqs,
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.getFaqById = async (req, res) => {
    try {

        let { id } = req.params;

        let projection = {
            category: 1,
            question: 1,
            answer: 1,
            status: 1,
            createdAt: 1,
        }

        let faqInfo = await Faq
            .find({ _id: id }, projection)

        if (!faqInfo) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        return res.json({
            status: true,
            message: 'Success',
            data: faqInfo,
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.updateFaqById = async (req, res) => {
    try {

        let { id } = req.params;
        let { question, answer, status } = req.body;

        let faqInfo = await Faq.countDocuments({ _id: id });
        if (!faqInfo) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        await Faq.updateOne({ _id: id }, { question, answer, status });

        return res.json({
            status: true,
            message: 'FAQ Updated successfully',
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.deleteFaqById = async (req, res) => {
    try {

        let { id } = req.params;

        let faqInfo = await Faq.countDocuments({ _id: id });
        if (!faqInfo) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        await Faq.deleteOne({ _id: id });

        return res.json({
            status: true,
            message: 'Deleted successfully',
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.getCms = async (req, res) => {
    try {

        let { page, size, sortOrder, sortField, search } = req.query;

        let limit = size ? parseInt(size) : 10;
        let skip = page ? parseInt(page) * limit : 0;
        let query = {};
        let projection = {};
        let sortQuery = { title: 1 };
        if (sortOrder && sortField) {
            sortQuery[sortOrder] = sortField === 'asc' ? 1 : -1;
        }
        if (search) {
            search = new RegExp(search, 'i');
            query['$or'] = [
                { category: search },
                { question: search },
                { answer: search },
            ]
        }

        projection = {
            updatedAt: 0,
        }
        let cmsCount = await Cms.countDocuments(query);
        if (!cmsCount) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        let cms = await Cms
            .find(query, projection)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery)

        return res.json({
            status: true,
            message: 'Success',
            count: cmsCount,
            data: cms,
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};

exports.getCmsById = async (req, res) => {
    try {

        let { id } = req.params;

        let projection = {
            title: 1,
            heading: 1,
            content: 1,
            image: 1,
            createdAt: 1,
        }

        let cms = await Cms
            .findOne({ _id: id }, projection)

        if (!cms) {
            return res.json({
                status: false,
                message: 'No data found!',
            });
        }

        return res.json({
            status: true,
            message: 'Success',
            data: cms,
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};


exports.updateCmsById = async (req, res) => {
    try {

        let { id } = req.params;
        let { heading, content } = req.body;
        let { image } = req.files || {};
        if (!isValidObjectId(id)) {
            return res.json({
                status: false,
                message: 'Invalid ID',
            });
        }

        let cms = await Cms.countDocuments({ _id: id });
        if (!cms) {
            return res.json({
                status: false,
                message: 'Cms not found',
            });
        }

        let updateObj = { heading, content };
        if (image) {
            let {
                status: isSuccess,
                result: imgRes,
                error,
            } = await uploadAssetInS3(image);
            if (!isSuccess) {
                return res.json({
                    status: false,
                    message: result,
                    error
                })
            }

            updateObj.image = imgRes;
        }
        await Cms.updateOne({ _id: id }, updateObj);

        return res.json({
            status: true,
            message: 'CMS updated successfully',
        });
    } catch (error) {
        console.error(error)
        return res.json({
            status: false,
            message: 'Error Occurred!',
            error: error.message,
        });
    }
};
