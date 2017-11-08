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


//Bhatta's config info
/*var config = {
=======
var tokens = [];

var config = {
>>>>>>> 45725bb6b578faf540d86b426918fc8c6fccbb51
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
var secret = "fb943a2432995dc8114f15f868bbec305fac35b82e610286a2155e807cb577d4";


app.post('/markdone', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts the item_id and list_id along with Secret
    if (req.body.secret && req.body.list_id && req.body.item_id) {
        // Parameters are fine
        
        if (req.body.secret == secret) {
            // Authorized for further operations

            var query = "UPDATE list_contents SET done = '1' WHERE list_id = '" + req.body.list_id + "' and item_id = '" + req.body.item_id + "';"

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

app.post('/share', function (req, res) {
    var retVal = {};
    var status_var;
    var result_list = [];

    //Accepts list_id, src_email, label along with the Secret
    if (req.body.list_id && req.body.src_email && req.body.label && req.body.secret) {
        //parameters are fine

        if (req.body.secret == secret) {
            //Authorized for further operations

            var query = "SELECT dest_email from circles WHERE src_email = '" + req.body.src_email + "' and label = '" + req.body.label + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    console.log(err);
                }
                else {
                    status_var = 200;
                    console.log("the list is " + result_list);
                    var temoStr = "";
                    for(var z = 0; z < result_list.length - 1; z++) {
                       temoStr = temoStr + "('" + req.body.list_id + "','" + result_list[z] + "'), " 
                    }
                    temoStr = temoStr + "('" + req.body.list_id + "','" + result_list[z] + "')";

                    var query1 = "INSERT INTO lists_share(list_id, email) VALUES" + temoStr + ";";

                    var request1 = new Request(query1, function (err, rowCount, rows) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    connection.execSql(request1);
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {

                columns.forEach(function (column) {
                    result_list.push(column.value);
                });
                //console.log(result_list);
            });
            connection.execSql(request);
            console.log("hello");
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        //insufficient parameters
        status_var = 400;
        retVal = {
            status: status_var
        }
        res.send(retVal);
    }
});

app.post('/unshare', function (req, res) {
    var retVal = {};
    var status_var;
    var result_list = [];

    // Accepst list_id, src_email, label along with Secret
    if (req.body.list_id && req.body.src_email && req.body.label && req.body.secret) {
        //Parameters are fine

        if (req.body.secret == secret) {
            //Authorized for further operations

            var query = "SELECT dest_email from circles WHERE src_email = '" + req.body.src_email + "' and label = '" + req.body.label + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    console.log(err);
                }
                else {
                    status_var = 200;
                    console.log("the list is " + result_list);
                    var temoStr = "";
                    for (var z = 0; z < result_list.length - 1; z++) {
                        temoStr = temoStr + "email = '" + result_list[z] + "' or  "
                    }
                    temoStr = temoStr + "email = '" + result_list[z] + "';";

                    var query1 = "delete from lists_share where " + temoStr + ";";

                    var request1 = new Request(query1, function (err, rowCount, rows) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    connection.execSql(request1);
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {

                columns.forEach(function (column) {
                    result_list.push(column.value);
                });
                //console.log(result_list);
            });
            connection.execSql(request);
            console.log("hello");
        }
        else {
            // Unauthorized access
            retVal["error"] = "Unauthorized Access";
            retVal["status"] = 405;
            res.send(retVal);
        }
    }
    else {
        status_var = 400;
        retVal = {
            status: status_var
        }
        res.send(retVal);
    }
});

app.post('/addlist', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts the name of the list (title in DB) and email id of the owner (owner in DB) along with Secret
    if (req.body.list_name &&  req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations, insert the user into the database
            
            var query = "INSERT INTO lists (owner,title) VALUES('" + req.body.email + "','" + req.body.list_name + "');";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;

                    var query1 = "select list_id from lists where owner = '" + req.body.email + "' and title = '" + req.body.list_name + "';";
                    var request1 = new Request(query1, function (err, rowCount, rows) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    request1.on('row', function (columns) {
                        
                        columns.forEach(function (column) {
                            retVal[column.metadata.colName] = column.value;
                        });
                        res.send(retVal);
                    });


                    connection.execSql(request1);

                }
                retVal["status"] = status_var;
                
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

app.post('/deletelist', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts the id of the list (title in DB) and email id of the owner (owner in DB) along with Secret
    if (req.body.list_id && req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations, insert the user into the database

            var query = "DELETE from lists WHERE owner = '" + req.body.email + "' and list_id = '" + req.body.list_id + "' ;";

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
