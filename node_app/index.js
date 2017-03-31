var connections_file = "../connected_file.json"
var bodyParser = require('body-parser');
var express = require('express')
var fs = require('fs')
var app = express();
var logger = require("morgan")
var redis = require("redis")


app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/stylesheets/'));


// set up port
var port = process.env.PORT || 3000;

// get an instance of the express Router
var router = express.Router();

var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('Redis server connected')
})

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
        redisClient.hmset(mac, ['timestamp', timestamp, 'alias', alias], function(err) {
            redisClient.sadd('connections', mac, function(err, reply) {
                if (err) {
                    console.log(err);
                }
                if (reply == 0){
                  res.send("FAILED")
                } else {
                  res.send("OK")
                }
            })
        })
    })

    // DELETE a connection (/api/whoshome)
    .delete(function(req, res) {
        var mac = req.body.mac
        redisClient.srem('connections', mac, function(err, reply) {
            if (err) {
                console.log(err);
            }
            if (reply == 0){
              res.send("FAILED")
            } else {
              res.send("OK")
            }
        })
    })

// REGISTER OUR ROUTES. all of our routes will be prefixed with /api
app.use('/', router);

// checks if json obj is empty
function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
}

// START THE SERVER
app.listen(port);
console.log('Running on port ' + port);
