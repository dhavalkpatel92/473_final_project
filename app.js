var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Db = require('mongodb').Db,
    Server = require('mongodb').Server;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: true
}));
var db = new Db('test_center', new Server('localhost', 27017));
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
    db.createCollection('quizzes', function(err) {
        if (err) console.log(err);
    });
    db.createCollection('quizzes_results', function(err) {
        if (err) console.log(err);
    });
    db.createCollection('que_results', function(err) {
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
var quizzes_collection = db.collection('quizzes');
var quizzes_results_collection = db.collection('quizzes_results');
var que_results_collection = db.collection('que_results');

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
        var post = {
            "user": sess.email,
            "post": req.body.post
        };
        posts_collection.insert(post);
        res.json(post);
    }
});

app.get('/all_posts', function(req, res) {
    if (sess.email) {
        posts_collection.find().toArray(function(err, items) {
            res.json(items);
        });
    }
});
app.post('/post_new_quiz', function(req, res) {
    sess = req.session;
    if (sess.email) {
        quizzes_collection.insert(req.body);
        var quizname = req.body.quiz_name;
        var quiz_obj = req.body[quizname];
        var quiz_que = [];
        var quiz_ans = [];
        for (var i = 0; i < quiz_obj.length; i++) {
            quiz_que.push(quiz_obj[i].question);
            quiz_ans.push(0);
        };
        que_results_collection.insert({
            quiz_name: quizname,
            quiz_que: quiz_que,
            quiz_ans: quiz_ans
        });
        res.send(req.body);
    }
});
app.get('/display_all_quizzes', function(req, res) {
    sess = req.session;
    if (sess.email) {
        //var quizzes_obj=[];
        quizzes_collection.find().toArray(function(err, items) {
            
            res.json(items);
            //console.log(quizzes_obj);
        });
    }

});
app.post('/submit_quiz_option', function(req, res) {
    sess = req.session;
    if (sess.email) {
        quizzes_collection.findOne({
            "quiz_name": req.body.quiz_id
        }, function(err, item) {
            if (err) console.log(err);
            res.json(item[req.body.quiz_id]);

        });
    }
});
app.post('/submit_quiz', function(req, res) {
    sess = req.session;
    var quizName = req.body.quiz_id;
    quizzes_collection.findOne({
        "quiz_name": quizName
    }, function(err, quiz) {
        var quiz_ans = quizName + "_ans";
        quizzes_results_collection.findOne({
            email: sess.email,
            quiz_name: quizName
        }, function(err, item) {
            if (item == null) {
                quizzes_results_collection.insert({
                    email: sess.email,
                    quiz_name: quizName,
                    result: req.body.answerA
                });
                var answerA = req.body.answerA;
                var result_obj = [];
                var total = 0;
                for (var i = 0; i < answerA.length; i++) {
                    var counter = 0;
                    if (answerA[i] == quiz[quiz_ans][i]) {
                        counter = 1;
                        total++;
                    }
                    result_obj.push(counter);
                }
                res.send({
                    "result_obj": result_obj,
                    "total": total
                });
            } else {
                res.send("error");
            }

        });
    });
});
app.post('/add_result_chart', function(req, res) {
    sess = req.session;
    if (sess.email) {

        que_results_collection.findOne({
            "quiz_name": req.body.quiz_id
        }, function(err, quiz_ques_rslts) {
            result_obj = req.body.data;
            final_obj = [];
            //console.log("found object"+quiz_ques_rslts["quiz_ans"]);
            for (var i = 0; i < quiz_ques_rslts["quiz_ans"].length; i++) {
                var temp = Number(result_obj[i]) + Number(quiz_ques_rslts["quiz_ans"][i]);
                final_obj.push(result_obj[i] + quiz_ques_rslts["quiz_ans"][i]);
            };
            que_results_collection.update({
                "quiz_name": req.body.quiz_id
            }, {
                $set: {
                    quiz_ans: final_obj
                }
            });
        });
        que_results_collection.find().toArray(function(err, items) {
            res.json(items);
        });

    }

});
app.get('/all_quiz_results', function(req, res) {
    sess = req.session;
    if (sess.email) {
        que_results_collection.find().toArray(function(err, items) {
            res.json(items);
        });
    }

});
io.on('connection', function(socket, req) {
    socket.on('send_post', function(data) {
        io.emit('send_post', data);
    });
    socket.on('send_que_rslt_chart', function(data) {
        if (data == "success") {
            console.log("working inside node");
            que_results_collection.find().toArray(function(err, items) {
                io.emit('send_que_rslt_chart', items);
            });
        }
    });
});
server.listen(3000);