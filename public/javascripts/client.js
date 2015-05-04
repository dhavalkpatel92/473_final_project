function noty_message(layout,type,text) {
        var n = noty({
            text        :text ,
            type        : type,
            dismissQueue: true,
            layout      : layout,
            theme       : 'defaultTheme',
            timeout:4000
        });
    //$("#noty_top_layout_container li").css("background-color","#2784ea");
       //console.log('html: ' + n.options.id);
}
$(document).ready(function() {
    $.ajax({
        url: '/userinfo',
        type: 'get',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(data) {
          $(".user_name").html(data.name);
          if(data.role==="professor")
          {
            $(".sidebar-menu").html("<li class='header'>Professor</li><li class='active'><a href='#'><span>Dashboard</span></a></li><li><a href='' id='add_quiz'><span>Add Quiz</span></a></li>");
            //console.log("professor menu here");
          }
          else
          {
            $(".sidebar-menu").html("<li class='header'>Student</li><li class='active'><a href='#'><span>Dashboard</span></a></li><li><a href='' id='display_all_quizzes'><span>Quiz</span></a></li>");
            //window.location.href="/home";
          }
          $(".sidebar-menu").append("<li><a href='' id='add_post'><span>Add Post</span></a></li>");
          $(".sidebar-menu").append("<li><a href='' id='all_posts'><span>All Posts</span></a></li>");

        }
    });

});
var socket = io();
$(document).on("click","#add_post",function(e) {
  e.preventDefault();
  $(".sidebar-menu li").removeClass('active');
  $(this).parent().addClass('active');
  $(".content-header h1").html("Add Post <small>Student or Professor can add post here</small>");
  $(".content").load("views/add_post.html");
})
var counter;
$(document).on("click","#add_quiz",function(e) {
  $(".sidebar-menu li").removeClass('active');
  $(this).parent().addClass('active');
  counter=2;
  e.preventDefault();
  $(".content-header h1").html("Add Quiz <small>Professor can add quiz here</small>");
  $(".content").load("views/add_quiz.html");
})

$(document).on("click","#add_que",function(e) {
  e.preventDefault();
  $("#que_Area").append('<div id="que'+counter+'_div"><div class="form-group"><label>Enter Question</label><input type="text" id="que'+counter+'" class="form-control" placeholder="Question ..." required></div><div class="form-group"><label>Enter Answer Options</label><input type="text" id="que'+counter+'_options" class="form-control" placeholder="Options ..." required></div><div class="form-group"><label>Enter Correct Answer</label><input type="text" id="que'+counter+'_ans" class="form-control" placeholder="Answer ..." required></div></div><br/><br/>');
  counter++;
})
$(document).on("click","#remove_que",function(e) {
  e.preventDefault();
  counter--;
  $("#que"+counter+"_div").remove();
})
$(document).on("submit","#post_quiz",function(e) {
  e.preventDefault();
  var result=[];
  var quiz_name=$("#quiz_name").val();
  for(var i=1;i<counter;i++)
  {
    var que=$("#que"+i+"").val();
    var options=$("#que"+i+"_options").val().split(',');
    var c_ans=$("#que"+i+"_ans").val();
    //var obj={"question:"que,"options":options,"answer":c_ans};
    var obj={
            "question": que,
            "options": options,
            "answer": c_ans
        }
    result.push(obj);
  }
  console.log(result);
  var quiz_result={};
  quiz_result[quiz_name]=result;
  $.ajax({
        url: '/post_new_quiz',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(quiz_result),
        //data:{result:result,quiz_name:quiz_name},
        success: function(data) {
              noty_message('top','success','Quiz Added');
              alert(data);
              socket.emit('send_quiz', data);
              $(".content").html('');
        }
    });
})
$(document).on("click","#display_all_quizzes",function(e) {
  e.preventDefault();
  $(".sidebar-menu li").removeClass('active');
  $(this).parent().addClass('active');
  $.ajax({
        url: '/display_all_quizzes',
        type: 'get',
        success: function(result) {
          $(".content").load("views/diplay_quiz_options.html");
          jQuery.each( result, function( key, val ) {
            
            jQuery.each( val, function( key, val ) {
              var i=1;
              if(key != "_id")
              {
                console.log(key);
                console.log(i);
                $(".form-group").append('<label><input type="radio" name="quizradios" id="quizradios'+i+'" value="option'+i+'">'+key+'</label>');
                i++;

              }
              
            });
          });
          //console.log(result);
        }
    });
  });

$(document).on("submit","#submit_post",function(e) {
  e.preventDefault();
  $(".sidebar-menu li").removeClass('active');
  $(this).parent().addClass('active');
  var post=$("#post_text_area").val();
  $.ajax({
        url: '/post_submit',
        type: 'post',
        data:{"post":post},
        success: function(data) {
          noty_message('top','success','Post Added');
          socket.emit('send_post', data);
          $(".content").html('').load("views/add_post.html").fadeIn(2000);
        }
    });

});

$(document).on("click","#all_posts",function(e) {
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
              $(".content .div_timeline").append("<ul class='timeline'><li><div class='timeline-item'><h3 class='timeline-header'><a href='#'>"+post.user+"</a></h3><div class='timeline-body'>"+post.post+"</div></div></li></ul>")
         });
        }
    });
});
socket.on('send_post',function(data){
        $(".content .div_timeline").append("<ul class='timeline'><li><div class='timeline-item'><h3 class='timeline-header'><a href='#'>"+data.user+"</a></h3><div class='timeline-body'>"+data.post+"</div></div></li></ul>");
});