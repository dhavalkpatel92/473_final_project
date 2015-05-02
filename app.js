var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var Db = require('mongodb').Db,
    Server = require('mongodb').Server;

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: true
}));
var db = new Db('project_2', new Server('localhost', 27017));
// Establish connection to db
db.open(function(err, db) {
    if (err) console.log(err);
    db.createCollection('users', function(err) {
        if (err) console.log(err);
        collection.insert({
            "_id": "admin",
            "name": "Admin",
            "email": "admin@admin.com",
            "password": "admin",
            "role": "professor"
        }, function(err, doc) {
            if (err) console.log("Already Created Admin");

        });
    });
});

app.get('/', function(req, res) {
    sess = req.session;
    if (sess.email) {
        res.redirect('/home');
        console.log("here");
    } else {
        res.render('index.html');
    }
});

app.use(express.static('public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);


var result = "none";
var sess;

var html_dir = './public/';
app.post('/login', function(req, res) {

    console.log('Admin side log');
    //var logincheck_result=logincheck(obj,req,result);
    collection.count(function(err, count) {
        if (err) console.log(err);
        collection.find({
            "email": req.body.email,
            "password": req.body.pwd
        }).toArray(function(err, item) {
            if (err) console.log(err);
            if (item.length == 1) {
                sess = req.session;
                sess.email = req.body.email;
                res.send("success");
            } else {
                //collection.insert(req.body);
                res.send("error");
            }
        });

    });
})

app.get('/home', function(req, res) {
    sess = req.session;
    if (sess.email) {
        res.render("home.html");
    } else {
        res.redirect("/");
    }

});
app.get('/logout', function(req, res) {

    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });

});
app.get('/register', function(req, res) {
    res.render("register.html");

});
var collection = db.collection('users');

app.post('/register', function(req, res) {

    collection.count(function(err, count) {
        if (err) console.log(err);
        collection.find({
            "email": req.body.email
        }).toArray(function(err, item) {
            if (err) console.log(err);
            if (item.length == 1) {
                res.send("error");
            } else {
                collection.insert(req.body);
                res.send("success");
            }
        });

    });
});
app.get('/userinfo', function(req, res) {
    sess = req.session;
    if (sess.email) {
    collection.count(function(err, count) {
        if (err) console.log(err);
        collection.findOne({
            "email": sess.email
        },function(err, item) {
            if (err) console.log(err);
                res.json(item);
            
        });

    });
    }
});
app.listen(3000);