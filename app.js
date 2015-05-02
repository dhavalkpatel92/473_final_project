var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
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
        users_collection.insert({
            "_id": "admin",
            "name": "Admin",
            "email": "admin@admin.com",
            "password": "admin",
            "role": "professor"
        }, function(err, doc) {
            if (err) console.log("Already Created Admin");

        });
    });
    db.createCollection('posts', function(err) {
        if (err) console.log(err);
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

    //console.log('Admin side log');
    //var logincheck_result=logincheck(obj,req,result);
    users_collection.count(function(err, count) {
        if (err) console.log(err);
        users_collection.find({
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
var users_collection = db.collection('users');
var posts_collection = db.collection('posts');

app.post('/register', function(req, res) {

    users_collection.count(function(err, count) {
        if (err) console.log(err);
        users_collection.find({
            "email": req.body.email
        }).toArray(function(err, item) {
            if (err) console.log(err);
            if (item.length == 1) {
                res.send("error");
            } else {
                users_collection.insert(req.body);
                res.send("success");
            }
        });

    });
});
app.get('/userinfo', function(req, res) {
    sess = req.session;
    if (sess.email) {
        users_collection.count(function(err, count) {
            if (err) console.log(err);
            users_collection.findOne({
                "email": sess.email
            }, function(err, item) {
                if (err) console.log(err);
                res.json(item);

            });

        });
    }
});

app.post('/post_submit', function(req, res) {
    sess = req.session;
    //console.log(req.body.post);
    if (sess.email) {
        var post={"user": sess.email,"post": req.body.post};
        posts_collection.insert(post);
        res.json(post);
    }
});
app.get('/all_posts', function(req, res) {
            if (sess.email) {
                
                posts_collection.find().toArray(function(err, items) {
                        //var result=[{"user":"asdasdas","post":"asdasdasdqwqwe"}];
                        /*
                        items.forEach(function(post) {
                                users_collection.findOne({
                                    "email": post.user
                                }, function(err,user) {
                                    if (err) console.log(err);
                                  });
                            });
                            //console.log(result);
                            res.json(result);
                        });
                        */ 
                        res.json(items);
                    //posts_collection.insert({"user":sess.email,"post":req.body.post});
                });
            } 
});
io.on('connection', function(socket,req){
    socket.on('send_post', function(data){
        //console.log("In socket"+data);
        io.emit('send_post',data)
    });
});
server.listen(3000);