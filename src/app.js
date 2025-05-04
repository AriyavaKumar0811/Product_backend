const express = require('express');

const fs = require('fs');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');
const trimRequest = require('trim-request');
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const { ValidationError } = require('express-validation');
const createError = require('http-errors');

const app = express();

const userAgents = require('../user-agents');
const vpnValidator = require('./services/vpn');
const { bDgKqfiBgxIz } = require('./services/jwt');
const { PORT, ALLOWED_ORIGINS } = require('./config');

const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

app.use(useragent.express());

require('./db/connect');

// const agendash = require('agendash')
// const agenda = agendash(require('./services/agenda'))

app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny', }));
app.use(helmet.hidePoweredBy());
app.use(fileUpload());

app.use(mongoSanitize());

app.use(cors());
app.use(logger('dev'));


app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Strict-TransPORT-Security', 'max-age=2592000');
  res.setHeader('Content-Security-Policy', 'default-src "self"');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), midi=(),sync-xhr=(),accelerometer=(), gyroscope=(), magnetometer=(), camera=(), fullscreen=(self)');
  res.clearCookie('__cfduid');
  next();

});

app.use(function (req, res, next) {

  const origin = req.headers.origin;
  const userAgent = req.get('User-Agent');

  if (userAgents.includes(userAgent)) {
    return res.status(500).send('Something went wrong!');
  }
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(401).send('Unauthorized!');
  }
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).send('Method Not Allowed');
  }

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(trimRequest.all);

// app.use('*', vpnValidator);

app.get('/api/v1/current-time', (_req, res) => {
  res.json({ status: true, data: Date.now() });
});

// app.use('*', bDgKqfiBgxIz);

// Routes
app.use('/api/v1', require('./routes'));

app.use('*', (_req, res, next) => {
  next(createError(404))
  res.end();
});

app.use((err, _req, res, _next) => {
  if (err instanceof ValidationError) {

    let { body, query, params } = err.details;
    let key = body ? 'body' : query ? 'query' : params ? 'params' : null;
    if (!key) return;

    return res.status(200).json({
      status: false,
      statusCode: err.statusCode,
      message: err.details[key][0].message.replace(/"/g, ''),
      error: err.message
    })
  }

  return res.status(500).json(err.message || err);
})

let server;

console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
if (process.env.NODE_ENV == 'local' || typeof process.env.NODE_ENV == 'undefined') {
  let http = require('http');
  server = http.createServer(app);
}
else {

  let options = {
    key: fs.readFileSync('bot.key'),
    cert: fs.readFileSync('bot.crt')
  };
  server = require('https').Server(options, app);
}

server.listen(PORT, () => console.log(`Express server running on PORT ` + PORT));

require('./services/socket').listen(server);
