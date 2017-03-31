var connections_file = "../connected_file.json"
var bodyParser = require('body-parser');
var express = require('express')
var fs = require('fs')
var app = express();
var logger = require("morgan")
var redis = require("redis")
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)

app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(logger('dev', {
  stream: fs.createWriteStream('./access.log', {flags: 'a'})
}))


// set up port
var port = process.env.PORT || 3000;

var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('Redis server connected')
})

var router = express.Router();
router.route('/')
router.route('/whoshome')

    // GET all connections (/api/whoshome)
    .get(function(req, res) {
        redisClient.smembers('connections', function(err, macs) {
            var multi = redisClient.multi();
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < macs.length; i++) {
                multi.hgetall(macs[i]);
            }
            multi.exec(function(err, connections) {
              // console.log(connections);
                res.render('index', {
                    'connections': connections
                })
            })
        })
    })

    // ADD a connection (/api/whoshome)
    .post(function(req, res) {
        var mac = req.body.mac
        var alias = req.body.alias
        var timestamp = req.body.timestamp
        var ip = req.body.ip
        redisClient.hmset(mac, ['MAC',mac,'timestamp', timestamp, 'alias', alias, 'ip',ip, 'connected','1'], function(err) {
            redisClient.sadd('connections', mac, function(err, reply) {
                if (err) {
                    console.log(err);
                    res.send("FAILED")
                } else {
                  res.send("OK")
                  io.sockets.emit('new connection', {
                    mac: mac,
                    timestamp: timestamp,
                    ip: ip,
                    alias: alias,
                    connected: '1'})
                }
            })
        })
    })

    // DELETE a connection (/api/whoshome)
    .delete(function(req, res) {
        var mac = req.body.mac
        // redisClient.srem('connections', mac, function(err, reply) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     if (reply == 0) {
        //         res.send("FAILED")
        //     } else {
        //         res.send("OK")
        //     }
        // })
        redisClient.hset(mac,"connected","0", function(err,reply) {
          if (err) {
              console.log(err);
          }
          if (reply != 0) {
              res.send("FAILED")
          } else {
              res.send("OK")
              io.sockets.emit('disconnection', {mac: req.body.mac})
          }
        })
    })

// REGISTER OUR ROUTES. all of our routes will be prefixed with /api
app.use('/', router);

connections = []

io.sockets.on('connection', function(socket){
  connections.push(socket)
  console.log('Connected: %s sockets connected', connections.length);

  // disconnect
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket),1)
    console.log('Disconnected: %s sockets connected', connections.length);
  })
})


// START THE SERVER
server.listen(port);
console.log('Running on port ' + port);
