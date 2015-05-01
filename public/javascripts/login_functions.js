function noty_message(layout,type,text) {
        var n = noty({
            text        :text ,
            type        : type,
            dismissQueue: true,
            layout      : layout,
            theme       : 'defaultTheme',
            timeout:false
        });
    //$("#noty_top_layout_container li").css("background-color","#2784ea");
       //console.log('html: ' + n.options.id);
    }
$(document).ready(function() {
$( "#user_login" ).submit(function( event ) {
  //alert( "Handler for .submit() called." );
  event.preventDefault();
    var data = $("#user_login").serialize();
    $.ajax({
        url: '/login',
        type: 'post',
        data:data,
        dataType: 'html',
        success: function(data) {
          //console.log(data);
          if(data==="error")
          {
            noty_message('top','error',"Please register first");
          }
          else
          {
            window.location.href="/home";
          }

        }
    });
});

$( "#register_user" ).submit(function( event ) {
  //alert( "Handler for register .submit() called." );
  event.preventDefault();
    //var data = $("#register_user").serialize();
    var name=$("#name").val();
    var email=$("#email").val();
    var password=$("#password").val();
    var c_password=$("#c_password").val();
    if(password===c_password)
    {
    var user = {
                        "name": name,
                        "email": email,
                        "password":password 
                };
    $.ajax({
        url: '/register',
        type: 'post',
        data:user,
        dataType: 'html',
        success: function(data) {
          //console.log("client side");
          if(data==="error")
          {
              noty_message('top','error','Already Created');
          }
          else
          {
            noty_message('top','success','User Created.Now Login');
          }
        }
    });
  }else{
    alert("password and confirm password is not matching");
  }
});

});

$( document ).on( "click","#logout", function( event ) {
  event.preventDefault();
  console.log("Logout Clicked");

});