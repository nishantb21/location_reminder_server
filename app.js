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

var crypto = require('crypto');

var app = express();

var tokens = [];

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
var secret = "fb943a2432995dc8114f15f868bbec305fac35b82e610286a2155e807cb577d4";

app.post('/signup', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts the Name, Email, Phone Number and Password along with Secret
    if (req.body.name && req.body.password && req.body.phoneno && req.body.email && req.body.secret) {
        // Parameters are fine
        
        if (req.body.secret == secret) {
            // Authorized for further operations, insert the user into the database
            // Hash the password before inserting into the database
            var hashed_password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');

            var query = "INSERT INTO users(email,name,phoneno,password) VALUES('" + req.body.email + "','" + req.body.name + "','" + req.body.phoneno + "','" + hashed_password + "');";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
});

app.post('/login', function (req, res) {
    //Accepts email, password and secret
    var retVal = {};
    var status_var;
    var flag = false;
    if (req.body.password && req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for login
            // Hash the incoming password
            var hashed_password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');

            var query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + hashed_password + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    //status_var = 200;
                    if (flag == true) {
                        status_var = 200;
                    }
                    else {
                        status_var = 404;
                        retVal["error"] = "Either username or password is incorrect."
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {
                flag = true;
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
    
});

app.post('/getalllists', function (req, res) {
    //Accepts email and secret
    var retVal = {};
    var result_list = [];
    var status_var;
    var flag = false;
    if (req.body.email && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for operation
            var query = "SELECT * FROM lists WHERE owner = '" + req.body.email + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    //status_var = 200;
                    if (flag == true) {
                        status_var = 200;
                        retVal["rows"] = result_list;
                    }
                    else {
                        status_var = 404;
                        retVal["error"] = "No lists found."
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {
                flag = true;
                var user = {};
                columns.forEach(function (column) {
                    user[column.metadata.colName] = column.value;
                });
                result_list.push(user);
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
});

app.post('/getlistcontents', function (req, res) {
    //Accepts a list_id and secret
    var retVal = {};
    var result_list = [];
    var status_var;
    var flag = false;
    if (req.body.list_id && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for operation
            var query = "SELECT * FROM list_contents WHERE list_id = '" + req.body.list_id + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    //status_var = 200;
                    if (flag == true) {
                        status_var = 200;
                        retVal["rows"] = result_list;
                    }
                    else {
                        status_var = 404;
                        retVal["error"] = "No list items found."
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {
                flag = true;
                var user = {};
                columns.forEach(function (column) {
                    user[column.metadata.colName] = column.value;
                });
                result_list.push(user);
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
});

app.post('/additem', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts list_id, email, item_name, location_name, latitude, longitude and secret
    if (req.body.list_id && req.body.item_name && req.body.secret && req.body.email) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for further operations
            var query;
            if (req.body.location_name && req.body.longitude && req.body.latitude) {
                // Location stuff was specified
                query = "INSERT INTO list_contents(list_id, email, item_name, location_name, longitude, latitude,done) VALUES(" + req.body.list_id + ",'" + req.body.email + "','" + req.body.item_name + "','" + req.body.location_name + "'," + req.body.longitude + "," + req.body.latitude + ",0);";
            }
            else {
                // Location stuff was not specified
                query = "INSERT INTO list_contents(list_id, email, item_name,done) VALUES(" + req.body.list_id + ",'" + req.body.email + "','" + req.body.item_name + "',0);";
            }

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
});

app.post('/deleteitem', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts list_id, item_id and secret
    if (req.body.list_id && req.body.item_id && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for further operations
            var query = "DELETE FROM list_contents WHERE list_id = " + req.body.list_id + " AND item_id = " + req.body.item_id + ";";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });
            connection.execSql(request);
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        // Not enough parameters passed
        retVal["status"] = 400;
        retVal["error"] = "Not enough parameters passed";
        res.send(retVal);
    }
});
{// error handlers
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
*/}
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log("Server is up and running...");
});
