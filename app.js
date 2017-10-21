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

//Bhatta's config info
/*var config = {
    userName: 'manager',
    password: 'Root1234',
    server: 'delilah.database.windows.net',
    options: {
        database: 'test',
        encrypt: true
    }
}*/

//Monish's config info
var config = {
    userName: 'test_1',
    password: 'hello123',
    server: 'MONISH',
    options: {
        database: 'MYSERVER1',
        database: 'test_a'
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


app.post('/dummySelect', function (req, res) {
    var retVal = {};
    var status_var;
    var result_list = [];
    if (req.body.name && req.body.email && req.body.phoneno && req.body.password && req.body.secret) {

        /*var query = "INSERT INTO users(email,name,phone,password) VALUES('" + req.body.email + "','" + req.body.name + "','" + req.body.phoneno + "','" + req.body.password + "');";
        console.log(query);*/
        var query = 'SELECT * FROM users;';

        var request = new Request(query, function (err, rowCount, rows) {
            if (err) {
                status_var = false;
                console.log(err);
            }
            else {
                status_var = true;
                console.log(result_list);
                retVal["rows"] = result_list;
            }
            retVal["status"] = status_var;
            res.send(retVal);
        });

        request.on('row', function (columns) {
            var user = {};
            columns.forEach(function (column) {
                user[column.metadata.colName] = column.value;
            });
            result_list.push(user);
        });
        connection.execSql(request);
    }
    else {
        status_var = false;
        retVal = {
            status: status_var
        }
        res.send(retVal);
    }
});

app.post('/dummyInsert', function (req, res) {
    var retVal = {};
    var status_var;
    if (req.body.name && req.body.email && req.body.phoneno && req.body.password && req.body.secret) {

        var query = "INSERT INTO users(email,name,phoneno,password) VALUES('" + req.body.email + "','" + req.body.name + "','" + req.body.phoneno + "','" + req.body.password + "');";

        var request = new Request(query, function (err, rowCount, rows) {
            if (err) {
                status_var = false;
                console.log(err);
            }
            else {
                status_var = true;
            }
            retVal["status"] = status_var;
            res.send(retVal);
        });
        connection.execSql(request);
    }
    else {
        status_var = false;
        retVal = {
            status: status_var
        }
        res.send(retVal);
    }
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
app.set('port', process.env.PORT || 3030);

var server = app.listen(app.get('port'), function () {
    console.log("Server is up and running...");
});
