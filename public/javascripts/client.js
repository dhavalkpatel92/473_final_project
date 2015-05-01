$(document).ready(function() {
    $.ajax({
        url: '/userinfo',
        type: 'get',
        dataType: 'html',
        success: function(data) {
          console.log(data);
          if(data==="error")
          {
            //noty_message('top','error',"Please register first");
          }
          else
          {
            //window.location.href="/home";
          }

        }
    });
});