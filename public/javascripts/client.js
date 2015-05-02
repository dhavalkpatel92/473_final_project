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
            $(".sidebar-menu").html("<li class='header'>Professor</li><li class='active'><a href='#'><span>Dashboard</span></a></li><li><a href=''><span>Add Quiz</span></a></li>");
            //console.log("professor menu here");
          }
          else
          {
            $(".sidebar-menu").html("<li class='header'>Student</li><li class='active'><a href='#'><span>Dashboard</span></a></li><li><a href=''><span>Quiz</span></a></li>");
            //window.location.href="/home";
          }
          $(".sidebar-menu").append("<li><a href='' id='add_post'><span>Add Post</span></a></li>");
          $(".sidebar-menu").append("<li><a href='' id='all_posts'><span>All Posts</span></a></li>");

        }
    });

});

$(document).on("click","#add_post",function(e) {
  e.preventDefault();
  $(".content-header h1").html("Add Post <small>Student or Professor can add post here</small>");
  $(".content").load("views/add_post.html");
})

$(document).on("submit","#submit_post",function(e) {
  e.preventDefault();
  var post=$("#post_text_area").val();
  $.ajax({
        url: '/post_submit',
        type: 'post',
        data:{"post":post},
        success: function(data) {
         
        }
    });
});

$(document).on("click","#all_posts",function(e) {
  e.preventDefault();
  //var post=$("#post_text_area").val();
  $(".content").html('');
  $.ajax({
        url: '/all_posts',
        type: 'get',
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        success: function(result) {
          //console.log(data);
          result.forEach(function(post) {
              $(".content-header h1").html("All Posts <small></small>");
              $(".content").append("<ul class='timeline'><li><div class='timeline-item'><h3 class='timeline-header'><a href='#'>"+post.user+"</a></h3><div class='timeline-body'>"+post.post+"</div></div></li></ul>")
              //console.log(entry.post);
        });
        }
    });
});