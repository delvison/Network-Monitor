// mysocket.js
// websocket used in the view of the index page

$(function() {
    var socket = io.connect();

    // new connection on network
    socket.on('new connection', function(data) {
        var found = false;
        $('.mac').each(function(i, obj) {

            // check if device already exists in our collection
            if (data['mac'].trim() === $(obj).text().trim()) {
                // get parent element
                var par = $(obj).parent();

                // check if device is currently disconnected
                if (par.hasClass('disconnected')) {
                    par.removeClass('disconnected').addClass('connected');
                    $('.log_area').prepend("<p>" + new Date($.now()) + ": " + data['mac'] + " connected.</p>");
                }
                // update timestamp
                var $ts = par.find('.timestamp');
                $ts.hide();
                setTimeout(function() {
                    $ts.show();
                }, 1000);

                // unknown devices treated as links for renaming purposes
                if (data['mac'].trim() === "UNKNOWN_DEVICE") {
                    par.find('.alias').html("<a href='#'>" + data['alias'] + "</a>");
                } else {
                    par.find('.alias').html("<p>" + data['alias'] + "</p>");
                }

                found = true;
                // $(this).append('<div class="popup" id="notification"><p>' + data["alias"] + ' connected</p></div>')
                // $('#notification').delay(5000).fadeOut('slow');
            }
        });
        if (!found) {
            // remove no devices found text
            $('#devices_error').detach();

            // add newly connected device
            $('#devices').append('<div class="device connected"><div class="alias"><p>' + data['alias'] +
                '</p></div><div class="ip"><p>' + data['ip'] + '</p></div><div class="mac"><p>' + data['mac'] +
                '</p></div><div class="timestamp"><p>' + data['timestamp'] + '</p></div></div>');

            // log the connection
            $('.log_area').prepend("<p>" + new Date($.now()) + ": " + data['mac'] + " connected.</p>");
        }
    });

    // new disconnection on network
    socket.on('disconnection', function(data) {
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
