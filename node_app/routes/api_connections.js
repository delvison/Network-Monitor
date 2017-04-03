// api_connections.js

// dependencies
var router = require('express').Router();

var get_macs = function(redisClient, callback) {
    redisClient.smembers('connections', function(err, connections) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, connections)
        }
    })
}

var get_connections = function(redisClient, callback) {
    get_macs(redisClient, function(err, macs) {
        var multi = redisClient.multi();
        for (var i = 0; i < macs.length; i++) {
            multi.hgetall(macs[i]);
        }
        multi.exec(function(err, connections) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, connections)
            }
        })
    })
}

exports.connections_router = function(redisClient, io) {

    router.route('/connections')

        // GET all connections
        .get(function(req, res) {
            get_connections(redisClient, function(err, connections) {
                if (err) {
                    console.log(err);
                }
                res.setHeader('content-Type', 'application/json')
                res.send(JSON.stringify({
                    connections: connections
                }));
            })
        })

        // ADD a connection (/api/connection)
        .post(function(req, res) {
            var mac = req.body.mac
            var alias = req.body.alias
            var timestamp = req.body.timestamp
            var ip = req.body.ip
            redisClient.hmset(mac, ['MAC', mac, 'timestamp', timestamp, 'alias', alias, 'ip', ip, 'connected', '1'], function(err) {
                redisClient.sadd('connections', mac, function(err, reply) {
                    if (err) {
                        console.log(err);
                        res.status(401).send()
                    } else {
                        res.status(200).send()
                        io.sockets.emit('new connection', {
                            mac: mac,
                            timestamp: timestamp,
                            ip: ip,
                            alias: alias,
                            connected: '1'
                        })
                    }
                })
            })
        })

        // DELETE a connection (/api/connection)
        .delete(function(req, res) {
            var mac = req.body.mac
            console.log(req.body);
            redisClient.hset(mac, "connected", "0", function(err, reply) {
                if (err) {
                    console.log(err);
                }
                if (reply != 0) {
                    res.status(401).send()
                } else {
                    res.status(200).send()
                    io.sockets.emit('disconnection', {
                        mac: req.body.mac
                    })
                }
            })
        })
    return router;
};

exports.get_connections = get_connections;
exports.get_macs = get_macs;
