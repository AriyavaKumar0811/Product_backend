const app = require('express').Router();

const cmsRoutes = require('./admin/cms.route');
const authRoutes = require('./admin/auth.route');
const homeRoutes = require('./front/home.route');
const userRoutes = require('./front/user.route');
const adminRoutes = require('./admin/admin.route');

app.use('/', homeRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/cms', cmsRoutes);
app.use('/admin/auth', authRoutes);

module.exports = app;