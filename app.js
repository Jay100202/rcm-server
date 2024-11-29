var bluebird = require('bluebird');
var AppConfig = require('./appconfig');
var mongoose = require('mongoose');

var DB_AUTH_CONNECTIVITY_STR = AppConfig.APP_DB_CONNECTION_STR;
// var DB_AUTH_CONNECTIVITY_STR = AppConfig.APP_DB_CONNECTION_STR + AppConfig.APP_DB_NAME;
// DB_AUTH_CONNECTIVITY_STR += '?authSource=' + AppConfig.APP_DB_DEST_AUTH_SOURCE;

const DB_CONNECTIVITY_CONFIG = {
  useNewUrlParser: true,
  // user: AppConfig.APP_DB_USERNAME,
  // pass: AppConfig.APP_DB_PASSWORD,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  useUnifiedTopology: true
};

// console.log('DB_AUTH_CONNECTIVITY_STR : ', DB_AUTH_CONNECTIVITY_STR)
// console.log('DB_CONNECTIVITY_CONFIG : ', DB_CONNECTIVITY_CONFIG)

mongoose.connect(DB_AUTH_CONNECTIVITY_STR, DB_CONNECTIVITY_CONFIG)
        .then(()=> { console.log(`Succesfully Connected to the Mongodb Database  at URL : ` + AppConfig.APP_DB_NAME)})
        .catch((e)=> { console.log(`Error Connecting to the Mongodb Database at URL : ` + AppConfig.APP_DB_NAME + ' : error : ', e) });

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var appRouter = require('./routes/app');

var apiRouter = require('./routes/api.route')
var adminapiRouter = require('./routes/adminapi.route')

var app = express();

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");  //http://localhost:4200 //* for any server
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, sukey, cukey,clkey, cmpkey, apikey, reqfrom, tzstr, tzofs");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}); 

//CORS
app.use(function(req, res, next) {
  const apikey = req.headers.apikey;
  const orgUrl = req.originalUrl;
  const reqFrom = req.headers.reqfrom;

  let isValid = false;
  if(orgUrl.includes("uploads")) // For excluding uploads
  {
    isValid = true;
  }
  else
  {
    if(reqFrom === AppConfig.HDR_REQ_FROM_PANEL && apikey == AppConfig.HDR_API_KEY_PANEL_SUPER_USER)
    {
      isValid = true;
    }
    else if(reqFrom === AppConfig.HDR_REQ_FROM_APP_USER && (AppConfig.VALID_HDR_API_KEY_CONSORTIUM_USER_APP_ARR).indexOf(apikey) >= 0)
    {
      isValid = true;
    }
  }

  if(isValid)
  {
    next();
  }
  else
  {
    return res.status(201).json({status: -1, message: "Invalid Request"});
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json({limit: '150mb', extended: true}));
app.use(express.urlencoded({limit: '150mb', extended: true, parameterLimit: 50000}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var bodyParser = require('body-parser');         
app.use(bodyParser.json({limit:'150mb'})); 
app.use(bodyParser.json({
    extended: true,
    limit: '150mb'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', appRouter);
app.use('/api', apiRouter);
app.use('/admapi', adminapiRouter);

// New code added
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  // Optionally, restart the app or log the error
  // process.exit(1); // You might still want to exit the app safely
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// error handler
app.use(function(req, res, next) {
   res.render('index');
});

module.exports = app;
