$(function() {
    var socket = io.connect();

    // new connection on network
    socket.on('new connection', function(data) {
        var found = false;
        $('.mac').each(function(i, obj) {
          // console.log(i+" "+$(obj).text());
            if (data['mac'].trim() === $(obj).text().trim()) {
                var par = $(obj).parent();
                par.removeClass('disconnected').addClass('connected');
                par.find('.timestamp').html("<p>" + data['timestamp'] + "</p>");
                found = true;
                // $(this).append('<div class="popup" id="notification"><p>' + data["alias"] + ' connected</p></div>')
                // $('#notification').delay(5000).fadeOut('slow');
                $('.log_area').prepend("<p>" + new Date($.now()) + ": " + data['mac'] + " updated.</p>");
            }
        });
        if (!found) {
            $('#devices_error').detach();
            $('#devices').append('<div class="device connected"><div class="alias"><p>' + data['alias'] + '</p></div><div class="ip"><p>' + data['ip'] + '</p></div><div class="mac"><p>' + data['mac'] + '</p></div><div class="timestamp"><p>' + data['timestamp'] + '</p></div></div>')
            $('.log_area').prepend("<p>" + new Date($.now()) + ": " + data['mac'] + " connected.</p>");
            // $('#devices').html("<embed src='blip.wav' hidden=true autostart=true loop=false>");
        }
    });

    // new disconnection on network
    socket.on('disconnection', function(data) {
        // console.log(data['mac']);
        $('.mac').each(function(i, obj) {
            if (data['mac'] === $(obj).text().trim()) {
                var par = $(obj).parent();
                par.addClass('disconnected').removeClass('connected');
                // $(this).append('<div class="popup" id="notification"><p>' + obj["alias"] + ' disconnected</p></div>')
                // $('#notification').delay(5000).fadeOut('slow');
            }
        });
        $('.log_area').prepend("<p>" + new Date($.now()) + ": " + data['mac'] + " disconnected.</p>");
    });
});
