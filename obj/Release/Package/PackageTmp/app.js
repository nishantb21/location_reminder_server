'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var app = express();

var config = {
    userName: 'manager',
    password: 'Root1234',
    server: 'delilah.database.windows.net',
    options: {
        database: 'test',
        encrypt: true
    }
}
var connection = new Connection(config)

connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected!");
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler


app.post('/register', function (req, res) {
    var retVal = {};
    if (req.body.name && req.body.email && req.body.phoneno && req.body.password) {
        retVal = {
            status: "Success"
        }
    }
    else {
        retVal = {
            status: "Failure"
        }
    }
    res.send(retVal);
});
// error handlers
/*
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
*/
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log("Server is up and running...");
});
