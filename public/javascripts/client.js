function noty_message(layout, type, text) {
    var n = noty({
        text: text,
        type: type,
        dismissQueue: true,
        layout: layout,
        theme: 'defaultTheme',
        timeout: 4000
    });
    //$("#noty_top_layout_container li").css("background-color","#2784ea");
    //console.log('html: ' + n.options.id);
}

function chart_init(id, questions, answers) {
    var randomScalingFactor = function() {
        return Math.round(Math.random() * 1000)
    };
    var ctx = $("#" + id).get(0).getContext("2d");

    var data = {
        labels: questions,
        datasets: [{
            fillColor: "rgba(151,187,205,0.5)",
            strokeColor: "rgba(151,187,205,0.8)",
            highlightFill: "rgba(151,187,205,0.75)",
            highlightStroke: "rgba(151,187,205,1)",
            data: answers
        }]
    }

    var myNewChart = new Chart(ctx).Bar(data, {
        responsive: true
    });
}
$(document).ready(function() {
    $.ajax({
        url: '/userinfo',
        type: 'get',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            $(".user_name").html(data.name);
            if (data.role === "professor") {
                $(".sidebar-menu").html("<li class='header'>Professor</li><li><a href='' id='prof_dashboard'><span>Dashboard</span></a></li><li><a href='' id='add_quiz'><span>Add Quiz</span></a></li>");
                //console.log("professor menu here");
            } else {
                $(".sidebar-menu").html("<li class='header'>Student</li><li class='active'><a href='#'><span>Dashboard</span></a></li><li><a href='' id='display_all_quizzes'><span>Quiz</span></a></li>");
                //window.location.href="/home";
            }
            $(".sidebar-menu").append("<li><a href='' id='add_post'><span>Add Post</span></a></li>");
            $(".sidebar-menu").append("<li><a href='' id='all_posts'><span>All Posts</span></a></li>");

        }
    });

});
var socket = io();
$(document).on("click", "#add_post", function(e) {
    e.preventDefault();
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    $(".content-header h1").html("Add Post <small>Student or Professor can add post here</small>");
    $(".content").load("views/add_post.html");
})
var counter;
$(document).on("click", "#add_quiz", function(e) {
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    counter = 2;
    e.preventDefault();
    $(".content-header h1").html("Add Quiz <small>Professor can add quiz here</small>");
    $(".content").load("views/add_quiz.html");
})

$(document).on("click", "#add_que", function(e) {
    e.preventDefault();
    $("#que_Area").append('<div id="que' + counter + '_div"><div class="form-group"><label>Enter Question</label><input type="text" id="que' + counter + '" class="form-control" placeholder="Question ..." required></div><div class="form-group"><label>Enter Answer Options</label><input type="text" id="que' + counter + '_options" class="form-control" placeholder="Options ..." required></div><div class="form-group"><label>Enter Correct Answer</label><input type="text" id="que' + counter + '_ans" class="form-control" placeholder="Answer ..." required></div></div><br/><br/>');
    counter++;
})
$(document).on("click", "#remove_que", function(e) {
    e.preventDefault();
    counter--;
    $("#que" + counter + "_div").remove();
})
$(document).on("submit", "#post_quiz", function(e) {
    e.preventDefault();
    var result = [];
    var quiz_name = $("#quiz_name").val().replace(/\s+/g, '');
    var answerA = [];
    for (var i = 1; i < counter; i++) {
        var que = $("#que" + i + "").val();
        var options = $("#que" + i + "_options").val().split(',');
        var c_ans = $("#que" + i + "_ans").val();
        //var obj={"question:"que,"options":options,"answer":c_ans};
        var obj = {
            "question": que,
            "options": options
        }
        result.push(obj);
        answerA.push(c_ans);
    }
    console.log(result);
    var quiz_result = {};
    quiz_result["quiz_name"] = quiz_name;
    quiz_result[quiz_name] = result;
    var quiz_ans = quiz_name + "_ans";
    quiz_result[quiz_ans] = answerA;
    $.ajax({
        url: '/post_new_quiz',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(quiz_result),
        //data:{result:result,quiz_name:quiz_name},
        success: function(data) {
            noty_message('top', 'success', 'Quiz Added');
            //alert(data);
            socket.emit('send_quiz', data);
            $(".content").html('');
        }
    });
})
$(document).on("click", "#display_all_quizzes", function(e) {
    e.preventDefault();
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    $.ajax({
        url: '/display_all_quizzes',
        type: 'get',
        success: function(result) {
            //$(".content").load("views/diplay_quiz_options.html");
            $(".content").load("Views/diplay_quiz_options.html", function() {
                var i = 1;
                jQuery.each(result, function(key, val) {

                    jQuery.each(val, function(key, val) {

                        if (key == "quiz_name") {
                            $(".form-group").append('<div class="radio"><label><input type="radio" name="quizradios" id="quizradios' + i + '" value="' + val + '">' + val + '</label></div>');
                            i++;
                        }

                    });
                });
            });
        }
    });
});
$(document).on("submit", "#submit_quiz_option", function(e) {
    e.preventDefault();
    var radio_val = $('input[name=quizradios]:checked', '#submit_quiz_option').val();
    $.ajax({
        url: '/submit_quiz_option',
        type: 'post',
        data: {
            "quiz_id": radio_val
        },
        success: function(data) {
            console.log(data);
            $(".content").load("Views/diplay_quiz_options.html", function() {
                $("#quiz_render_form").html('<div class="box-header"><h3 class="box-title">' + radio_val + '</h3></div><form action="" role="form" id="submit_quiz_questions"><input type="hidden" value="' + radio_val + '" id="quiz_name_hidden"><div class="box-body"><div class="form-group"></div></div><div class="box-footer"><button type="submit" class="btn btn-primary">Submit</button></div></form>');
                for (var i = 0; i < data.length; i++) {
                    jQuery.each(data[i], function(key, val) {
                        if (key == "question") {
                            $("#submit_quiz_questions .form-group").append('<label>' + val + '</label>');
                        }
                        if (key == "options") {
                            for (var j = 0; j < data[i]["options"].length; j++) {
                                $("#submit_quiz_questions .form-group").append('<div class="radio"><label><input type="radio" name="quizradios' + i + '" id="quizradios' + i + '" value="' + data[i]["options"][j] + '">' + data[i]["options"][j] + '</label></div>');
                            }
                        }
                    });
                }
            });

        }
    });

});
$(document).on("submit", "#submit_quiz_questions", function(e) {
    e.preventDefault();
    var quiz_ID = $("#quiz_name_hidden").val();
    var ans = [];
    $('input[type="radio"]:checked').each(function() {
        ans.push(this.value);
    });
    $.ajax({
        url: '/submit_quiz',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            "quiz_id": quiz_ID,
            "answerA": ans
        }),
        success: function(data) {
            if (data == "error") {
                noty_message('top', 'error', 'Already given.Cannot do again');
            } else {
                noty_message('top', 'success', 'Quiz Submitted..You got   ' + data.total);
                var quiz_rslt_obj = data.result_obj;
                console.log(quiz_rslt_obj);
                $.ajax({
                    url: '/add_result_chart',
                    type: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "data": quiz_rslt_obj,
                        "quiz_id": quiz_ID
                    }),
                    success: function(data) {
                        socket.emit('send_que_rslt_chart', "success");
                    }
                });
            }
            $('.content').html('');


        }
    });
});

$(document).on("submit", "#submit_post", function(e) {
    e.preventDefault();
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    var post = $("#post_text_area").val();
    $.ajax({
        url: '/post_submit',
        type: 'post',
        data: {
            "post": post
        },
        success: function(data) {
            noty_message('top', 'success', 'Post Added');
            socket.emit('send_post', data);
            $(".content").html('').load("views/add_post.html").fadeIn(2000);
        }
    });

});

$(document).on("click", "#all_posts", function(e) {
    e.preventDefault();
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    $(".content").html('<div class="div_timeline"></div>');
    $.ajax({
        url: '/all_posts',
        type: 'get',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(result) {
            //console.log(data);
            result.forEach(function(post) {
                $(".content-header h1").html("All Posts <small></small>");
                $(".content .div_timeline").append("<ul class='timeline'><li><div class='timeline-item'><h3 class='timeline-header'><a href='#'>" + post.user + "</a></h3><div class='timeline-body'>" + post.post + "</div></div></li></ul>")
            });
        }
    });
});
$(document).on("click", "#prof_dashboard", function(e) {
    e.preventDefault();
    $(".sidebar-menu li").removeClass('active');
    $(this).parent().addClass('active');
    $(".content").html('<div id="prof_chart"></div>');
    //chart_init("canvas",["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"],[23,45,67,89,12]);

    $.ajax({
        url: '/all_quiz_results',
        type: 'get',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                $("#prof_chart").append('<h2 class="page-header">' + data[i]["quiz_name"] + '</h2>');
                $("#prof_chart").append('<canvas id="canvas_' + data[i]["quiz_name"] + '" height="250" width="400"></canvas>');
                chart_init("canvas_" + data[i]["quiz_name"], data[i]["quiz_que"], data[i]["quiz_ans"]);
            }
        }
    });
});
socket.on('send_post', function(data) {
    $(".content .div_timeline").append("<ul class='timeline'><li><div class='timeline-item'><h3 class='timeline-header'><a href='#'>" + data.user + "</a></h3><div class='timeline-body'>" + data.post + "</div></div></li></ul>");
});
socket.on('send_que_rslt_chart', function(data) {
    console.log("data through socket" + data);
    for (var i = 0; i < data.length; i++) {
        $("#prof_chart").append('<h2 class="page-header">' + data[i]["quiz_name"] + '</h2>');
        $("#prof_chart").append('<canvas id="canvas_' + data[i]["quiz_name"] + '" height="250" width="400"></canvas>');
        chart_init("canvas_" + data[i]["quiz_name"], data[i]["quiz_que"], data[i]["quiz_ans"]);
    }
});