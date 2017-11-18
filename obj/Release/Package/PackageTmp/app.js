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
var app = express();
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var request_http = require('request');
var crypto = require('crypto');


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

var flag_connection = false;
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
var default_label = "friends";
var secret = "fb943a2432995dc8114f15f868bbec305fac35b82e610286a2155e807cb577d4";

function makeCall(request) {
    var interval;
    if (flag_connection == false) {
        interval = setInterval(function () {
            if (flag_connection == true) {
                connection.execSql(request);
                clearInterval(interval);
            }
        }, 100);
    }
    else {
        connection.execSql(request);
    }
}

function sendMessageToUser(deviceId, message, title) {
    
    request_http({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
            'Content-Type': ' application/json',
            'Authorization': 'key=AAAAHm4FIKY:APA91bEbVbP-2TZHr-uJ0d7x09cgI01IXv9EKyl3MjH_NCqtwtr2CR87Ra_7RqoJrPG7rZZy0OOi3_0gj8OHqM6oOpMit3cDKOb7a6CjxWpKUBYJywK8Q5v0pLhBMdQM3xf13UJl2Yzl'
        },
        body: JSON.stringify(
            {
                'registration_ids': deviceId,
                'notification': {
                    'title': title,
                    'body': message
                }
            }
        )
    }, function (error, response, body) {
        //console.log(response.body);
        if (error || (response.statusCode >= 400)) {
            console.log("FCM Error");
        }
    });
}

function createMessage(type, message_params) {
    var message = "";
    // Type 1 is when a user shares a new list 
    // Type 2 is when a user adds an item to another list
    if (type == 1) {
        message = message_params["name"] + " has shared " + "'" + message_params["title"] + "'" + " with you.";
    }
    else {
        message = message_params["editor"] + " has added " + message_params["item_name"] + " to " + message_params["list_name"];
    }
    return message;
}

connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Connected!");
        flag_connection = true;
    }
});

app.post('/register', function (req, res) {
    var retVal = {};
    var status_var;
    // Accepts the email, token and secret
    if (req.body.email && req.body.token && req.body.secret){
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for further operations

            var query = "INSERT INTO tokens(email,token) VALUES('" + req.body.token + "','" + req.body.email + "');";

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
            makeCall(request);
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
            makeCall(request);
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
            makeCall(request);
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
    var list_list_ids = [];
    var counter = 0;
    var status_var;
    var flag = false;
    if (req.body.email && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for operation
            var query = "SELECT list_id,title,shareable FROM lists WHERE owner = '" + req.body.email + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                    retVal["status"] = status_var;
                    res.send(retVal);
                }
                else {

                    if (flag == false) {
                        status_var = 404;
                        retVal["error"] = "No lists found for this user";
                        retVal["status"] = status_var;
                        res.send(retVal);
                    }
                    else {
                        var temp = Object.keys(list_list_ids).join();
                        var query1 = "SELECT * FROM list_contents WHERE list_id IN (" + temp + ");";
                        var request1 = new Request(query1, function (err, rowCount, rows) {
                            if (err) {
                                status_var = 500;
                                retVal["error"] = err.message;
                            }
                            else {
                                status_var = 200;
                                retVal["lists"] = result_list;
                            }
                            retVal["status"] = status_var;
                            res.send(retVal);
                        });
                        request1.on('row', function (columns) {
                            var index = -1;
                            var item = {};
                            columns.forEach(function (column) {
                                if (column.metadata.colName == "list_id") {
                                    index = list_list_ids[column.value];
                                    result_list[index]["empty"] = false;
                                }
                                else {
                                    item[column.metadata.colName] = column.value;
                                }
                            });
                            result_list[index]["items"].push(item);
                        });
                        makeCall(request1);
                    }
                }
                
            });

            request.on('row', function (columns) {
                flag = true;
                var index = -1;
                columns.forEach(function (column) {
                    if (column.metadata.colName == "list_id") {
                        index = counter;
                        list_list_ids[column.value] = index;
                        result_list[index] = {};
                        result_list[index]["list_id"] = column.value;
                        result_list[index]["empty"] = true;
                        result_list[index]["items"] = [];
                        counter++;
                    }
                    else {
                        result_list[index][column.metadata.colName] = column.value;
                    }
                });
            });
            makeCall(request);
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
            makeCall(request);
            
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
    var item;
    var list_metadata = {};
    var editor;
    var status_var;
    // Accepts list_id, email, item_name, location_name, latitude, longitude and secret
    if (req.body.list_id && req.body.item_name && req.body.secret && req.body.email) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for further operations
            var query;
            var item = {
                "item_name": req.body.item_name,
                "location_name": req.body.location_name
            };
            if (req.body.location_name && req.body.longitude && req.body.latitude) {
                // Location stuff was specified
                query = "INSERT INTO list_contents(list_id, email, item_name, location_name, longitude, latitude,done) OUTPUT Inserted.item_id VALUES(" + req.body.list_id + ",'" + req.body.email + "','" + req.body.item_name.replace("'", "''") + "','" + req.body.location_name.replace("'", "''") + "'," + req.body.longitude + "," + req.body.latitude + ",0); SELECT owner,title FROM lists WHERE list_id = " + req.body.list_id + "; SELECT name FROM users WHERE email = '" + req.body.email + "'";
                console.log(query);
                item["location_name"] = req.body.location_name;
                item["logitude"] = req.body.longitude;
                item["latitude"] = req.body.latitude;
            }
            else {
                // Location stuff was not specified
                query = "INSERT INTO list_contents(list_id, email, item_name,done) OUTPUT Inserted.item_id VALUES(" + req.body.list_id + ",'" + req.body.email + "','" + req.body.item_name + "',0);";
            }

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;
                    if (list_metadata["owner"] != req.body.email) {
                        var token = [];
                        var query1 = "SELECT token FROM tokens WHERE email = '" + list_metadata["owner"] + "';"
                        var request1 = new Request(query1, function (error, rowCount, rows) {
                            if (err) {
                                
                            }
                            else {
                                var message_params = {
                                    "editor": editor,
                                    "item_name": item["item_name"],
                                    "list_name": list_metadata["title"]
                                }
                                var message = createMessage(2, message_params);
                                sendMessageToUser(token, message, "New item added");
                                
                            }
                        });
                        request1.on('row', function (columns) {
                            columns.forEach(function (column) {
                                token.push(column.value);
                            });
                        });
                        connection.execSql(request1);
                    }
                }
                retVal["status"] = status_var;
                if (status_var = 200) {
                    retVal["item_id"] = item["item_id"];
                }
                res.send(retVal);
            });
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    if (column.metadata.colName == "item_id") {
                        item[column.metadata.colName] = column.value;
                    }
                    else if (column.metadata.colName == "name"){
                        editor = column.value; 
                    }
                    else {
                        list_metadata[column.metadata.colName] = column.value;
                    }
                });
            });
            makeCall(request);
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
    var row_count;
    // Accepts list_id, item_id and secret
    if (req.body.list_id && req.body.item_id && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for further operations
            var query = "DELETE FROM list_contents WHERE list_id = " + req.body.list_id + " AND item_id = " + req.body.item_id + " SELECT @@ROWCOUNT AS deleted;";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    if (row_count == 0) {
                        status_var = 404;
                        retVal["error"] = "Either the list_id or the item_id or both don't exist."
                    }
                    else {
                        status_var = 200;
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on("row", function (columns) {
                columns.forEach(function (column) {
                    row_count = column.value;
                }); 
            });
            makeCall(request);
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

{/*app.post('/markdone', function (req, res) {
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
            makeCall(request);
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
                    for (var z = 0; z < result_list.length - 1; z++) {
                        temoStr = temoStr + "('" + req.body.list_id + "','" + result_list[z] + "'), "
                    }
                    temoStr = temoStr + "('" + req.body.list_id + "','" + result_list[z] + "')";

                    var query1 = "INSERT INTO lists_share(list_id, email) VALUES" + temoStr + ";";

                    var request1 = new Request(query1, function (err, rowCount, rows) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    makeCall(request1);
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
                    makeCall(request1);
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
});*/}

app.post('/createlist', function (req, res) {
    var retVal = {};
    var status_var;
    var list_id;
    // Accepts the name of the list (title in DB) and email id of the owner (owner in DB) along with Secret
    if (req.body.list_name && req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations, insert the user into the database

            var query = "INSERT INTO lists (owner,title) OUTPUT Inserted.list_id VALUES('" + req.body.email + "','" + req.body.list_name.replace("'", "''") + "');";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    status_var = 200;
                }
                retVal["status"] = status_var;
                if (status_var == 200) {
                    retVal["list_id"] = list_id;
                }
                res.send(retVal);
            });
            request.on('row', function (columns) {
                columns.forEach(function (column) {
                    list_id = column.value;
                });
            });
            makeCall(request);
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
    var row_count;
    var status_var;
    // Accepts the id of the list (title in DB) along with Secret
    if (req.body.list_id && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations, insert the user into the database

            var query = "DELETE from lists WHERE  list_id = '" + req.body.list_id + "' SELECT @@ROWCOUNT AS deleted;";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    if (row_count == 0) {
                        status_var = 404;
                        retVal["error"] = "The list_id is invalid."
                    }
                    else {
                        status_var = 200;
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on("row", function (columns) {
                columns.forEach(function (column) {
                    row_count = column.value;
                });
            });

            makeCall(request);
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

app.post('/getnotificationdetails', function (req, res) {
    //Accepts item_id and secret
    var retVal = {};
    var status_var;
    var flag = false;
    if (req.body.item_id && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for operations

            var query = "SELECT location_name,item_name FROM list_contents WHERE item_id = " + req.body.item_id + ";";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                }
                else {
                    if (flag == true) {
                        status_var = 200;
                    }
                    else {
                        status_var = 404;
                        retVal["error"] = "Item_id is incorrect."
                    }
                }
                retVal["status"] = status_var;
                res.send(retVal);
            });

            request.on('row', function (columns) {
                flag = true;
                columns.forEach(function (column) {
                    retVal[column.metadata.colName] = column.value;
                });
            });
            makeCall(request);
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

app.post('/addfriend', function (req, res) {
    //Accepts src_email, dest_email and secret
    var retVal = {};
    var status_var;
    if (req.body.src_email && req.body.dest_email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for operations
            if (req.body.src_email != req.body.dest_email) {
                var query = "INSERT INTO circles VALUES('" + req.body.src_email + "','" + req.body.dest_email + "','" + default_label + "'),('" + req.body.dest_email + "','" + req.body.src_email + "','" + default_label + "');";

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
                makeCall(request);
            }
            else {
                retVal["error"] = "Both emails cannot be same"
                retVal["status"] = 401;
            }
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

app.post('/viewfriends', function (req, res) {
    //Accepts email and secret
    var retVal = {};
    var status_var;
    var indices = {};
    var result_list = [];
    var friend_list = [];
    var flag = false;
    if (req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for operations

            var query = "SELECT dest_email FROM circles WHERE src_email = '" + req.body.email + "';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                    retVal["status"] = status_var;
                    res.send(retVal);
                }
                else {
                    if (flag == true) {
                        status_var = 200;
                        var query1 = "SELECT email,name FROM users WHERE email in (" + friend_list.map(function (x) { return "'" + x + "'" }).join() + ");";
                        var request1 = new Request(query1, function (err, rowCount, rows) {
                            if (err) {
                                status_var = 500;
                                retVal["error"] = err.message;
                                retVal["status"] = status_var;
                                res.send(retVal);
                            }
                            else {
                                status_var = 200;
                                retVal["friends"] = result_list;
                                retVal["status"] = status_var;
                                res.send(retVal);
                            }
                        });

                        request1.on('row', function (columns) {
                            var friend = {};
                            columns.forEach(function (column) {
                                friend[column.metadata.colName] = column.value;
                            });
                            result_list.push(friend);
                        });
                        makeCall(request1);
                    }
                    else {
                        status_var = 404;
                        retVal["error"] = "The user has no friends or doesn't exist."
                        retVal["status"] = status_var;
                        res.send(retVal);
                    }
                }
            });

            request.on('row', function (columns) {
                flag = true;
                columns.forEach(function (column) {
                    friend_list.push(column.value);
                });
            });
            makeCall(request);
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

app.post('/viewpeerlists', function (req, res) {
    //Accepts email and secret
    var retVal = {};
    var result_list = [];
    var list_list_ids = [];
    var counter = 0;
    var status_var;
    var flag = false;
    if (req.body.email && req.body.secret) {
        // Parameters are fine
        if (req.body.secret == secret) {
            // Authorized for operation
            var query = "SELECT list_id,title FROM lists WHERE owner = '" + req.body.email + "' AND shareable = '1';";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["error"] = err.message;
                    retVal["status"] = status_var;
                    res.send(retVal);
                }
                else {

                    if (flag == false) {
                        status_var = 404;
                        retVal["error"] = "No lists found for this user";
                        retVal["status"] = status_var;
                        res.send(retVal);
                    }
                    else {
                        var temp = Object.keys(list_list_ids).join();
                        var query1 = "SELECT * FROM list_contents WHERE list_id IN (" + temp + ");";
                        var request1 = new Request(query1, function (err, rowCount, rows) {
                            if (err) {
                                status_var = 500;
                                retVal["error"] = err.message;
                            }
                            else {
                                status_var = 200;
                                retVal["lists"] = result_list;
                            }
                            retVal["status"] = status_var;
                            res.send(retVal);
                        });
                        request1.on('row', function (columns) {
                            var index = -1;
                            var item = {};
                            columns.forEach(function (column) {
                                if (column.metadata.colName == "list_id") {
                                    index = list_list_ids[column.value];
                                    result_list[index]["empty"] = false;
                                }
                                else {
                                    item[column.metadata.colName] = column.value;
                                }
                            });
                            result_list[index]["items"].push(item);
                        });
                        makeCall(request1);
                    }
                }

            });

            request.on('row', function (columns) {
                flag = true;
                var index = -1;
                columns.forEach(function (column) {
                    if (column.metadata.colName == "list_id") {
                        index = counter;
                        list_list_ids[column.value] = index;
                        result_list[index] = {};
                        result_list[index]["list_id"] = column.value;
                        result_list[index]["empty"] = true;
                        result_list[index]["items"] = [];
                        counter++;
                    }
                    else {
                        result_list[index]["title"] = column.value;
                    }
                });
            });
            makeCall(request);
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

app.post('/makepublic', function (req, res) {
    var retVal = {};
    var device_token_list = [];
    var notification = {};
    var message_params = {};
    var status_var;
    var updated = 0;
    // Accepts the list_id and Secret
    if (req.body.list_id && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations

            var query = "UPDATE lists SET shareable = '1' OUTPUT INSERTED.owner,INSERTED.title WHERE list_id = " + req.body.list_id + ";";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["status"] = status_var;
                    retVal["error"] = err.message;
                    res.send(retVal);
                }
                else {
                    if (updated == 0) {
                        status_var = 404;
                        retVal["status"] = status_var;
                        retVal["error"] = "The list_id was not found."
                        res.send(retVal);
                    }
                    else {
                        var query1 = "SELECT name FROM users WHERE email = '" + notification["owner"] + "'; SELECT title FROM lists WHERE list_id = " + req.body.list_id + "; SELECT token FROM tokens WHERE email IN (SELECT dest_email FROM circles WHERE src_email = '" + notification["owner"] + "');";
                        console.log(query1);
                        var request1 = new Request(query1, function (err, rowCount, rows) {
                            if (err) {
                                status_var = 500;
                                retVal["status"] = status_var;
                                retVal["error"] = err.message;
                                res.send(retVal);
                            }
                            else {


                                var message = createMessage(1, message_params);
                                sendMessageToUser(device_token_list, message, "New list added!");
                                status_var = 200;
                                retVal["status"] = 200;
                                res.send(retVal);
                            }
                        });
                        request1.on('row', function (columns) {
                            columns.forEach(function (column) {
                                if (column.metadata.colName == "name" || column.metadata.colName == "title") {
                                    message_params[column.metadata.colName] = column.value;
                                }
                                else {
                                    device_token_list.push(column.value);
                                }
                            });
                        });
                        connection.execSql(request1);
                    }
                }
            });

            request.on('row', function (columns) {
                updated++;
                columns.forEach(function (column) {
                    notification[column.metadata.colName] = column.value;
                });
            });
            makeCall(request);
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

app.post('/makeprivate', function (req, res) {
    var retVal = {};
    var email_list = [];
    var device_token_list = [];
    var status_var;
    var updated = 0;
    // Accepts the list_id and Secret
    if (req.body.list_id && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for further operations

            var query = "UPDATE lists SET shareable = '0' OUTPUT INSERTED.owner WHERE list_id = " + req.body.list_id + ";";

            var request = new Request(query, function (err, rowCount, rows) {
                if (err) {
                    status_var = 500;
                    retVal["status"] = status_var;
                    retVal["error"] = err.message;
                    res.send(retVal);
                }
                else {
                    if (updated == 0) {
                        status_var = 404;
                        retVal["status"] = status_var;
                        retVal["error"] = "The list_id was not found."
                        res.send(retVal);
                    }
                    else {
                        /*var query1 = "";
                        var request1 = new Request(query1, function (err, rowCount, rows) {
                        });
                        request1.on('row', function (columns) {
                            columns.forEach(function (column) {
                                device_token_list.push(email)
                            });
                        });*/
                        retVal["status"] = 200;
                        res.send(retVal);
                    }
                }
            });

            request.on('row', function (columns) {
                updated++;
                columns.forEach(function (column) {
                    email_list.push(column.value);
                });
            });
            makeCall(request);
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

app.post('/tokenregistration', function (req, res) {
    //Accepts token, email and secret
    var retVal = {};
    var status_var;
    if (req.body.token && req.body.email && req.body.secret) {
        // Parameters are fine

        if (req.body.secret == secret) {
            // Authorized for operations
            var query = "IF EXISTS (SELECT * FROM tokens WHERE email = '" + req.body.email + "') BEGIN UPDATE tokens SET token = '" + req.body.token + "' WHERE email = '" + req.body.email + "' END ELSE BEGIN INSERT INTO tokens(email,token) VALUES('" + req.body.email +  "','" + req.body.token + "') END ";
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
            makeCall(request);
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

app.post('/getnotifications', function (req, res) {
    // TODO
    var query = "SELECT * FROM users;SELECT * from lists;"
    var request = new Request(query, function (error, rowCount, rows) {
        if (error) {
            console.log(error);
        }
        else {
            console.log("success");
        }
    });
    request.on("row", function (columns) {
        columns.forEach(function (column) {
            console.log(column.metadata.colName + ":" + column.value);
        });
    });
    res.send("Done");
    connection.execSql(request);
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log("Server is up and running...");
});
