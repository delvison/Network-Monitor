// websocket.js

connections = []

module.exports = function(io) {
  console.log('hi');
    io.sockets.on('connection', function(socket) {
        connections.push(socket)
        console.log('Connected: %s sockets connected', connections.length);

        // disconnect
        socket.on('disconnect', function(data) {
            connections.splice(connections.indexOf(socket), 1)
            console.log('Disconnected: %s sockets connected', connections.length);
        })
    })
    return io;
}
