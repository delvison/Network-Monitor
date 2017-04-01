
  $(function(){
    var socket = io.connect();

    // new connection on network
    socket.on('new connection', function(data){
      var found = false;
      $('.mac').each(function(i, obj){
        if (data['mac'] === $(obj).text().trim()){
          console.log('MATCH!');
          var par = $(obj).parent();
          par.removeClass('disconnected').addClass('connected');
          par.find('.timestamp').html("<p>"+data['timestamp']+"</p>");
          found = true;
        }
      });
      if (!found) {
        $('#devices_error').detach();
        $('#devices').append('<div class="device connected"><div class="alias"><p>'+data['alias']+'</p></div><div class="ip"><p>'+data['ip']+'</p></div><div class="mac"><p>'+data['mac']+'</p></div><div class="timestamp"><p>'+data['timestamp']+'</p></div></div>')
      }
    });

    // new disconnection on network
    socket.on('disconnection', function(data){
      // console.log(data['mac']);
      $('.mac').each(function(i, obj){
        if (data['mac'] === $(obj).text().trim()){
          var par = $(obj).parent();
          par.addClass('disconnected').removeClass('connected');
        }
    });
  });
});
