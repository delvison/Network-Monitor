// ConnectionHandler.js

let ConnectionHandler = function(redisClient, io) {
    this.redisClient = redisClient;
    this.io = io;

    // get all mac addresses
    this.get_macs = (redisClient, callback) => {
        redisClient.smembers('connections', (err, connects) => {
            if (err) return callback(err);
            return callback(null, connects);
        });
    };

    // get all connections
    this.get_connections = (redisClient, callback) => {
        this.get_macs(redisClient, (err, macs) => {
            let multi = redisClient.multi();
            Object.keys(macs).map(mac => multi.hgetall(macs[mac]));
            multi.exec((err, connects) => {
                if (err) return callback(err);
                callback(null, connects);
            });
        });
    };

    // GET all connections (GET /api/connections)
    this.getAll = (req, res) => {
        this.get_connections(redisClient, (err, connects) => {
            if (err) return res.status(404).send();
            res.setHeader('content-Type', 'application/json');
            res.status(200).send(JSON.stringify({
                connections: connects
            }));
        });
    };

    // ADD a connection (POST /api/connections)
    this.addConnection = (req, res) => {
        let mac = req.body.mac;
        let alias = req.body.alias;
        let timestamp = req.body.timestamp;
        let ip = req.body.ip;
        // TODO: clean up using multi
        this.redisClient.hmset(mac, ['MAC', mac,
                'timestamp', timestamp,
                'alias', alias,
                'ip', ip,
                'connected', '1'
            ],
            (err) => {
                this.redisClient.sadd('connections', mac,
                    (err, reply) => {
                        if (err) return res.status(400).send();
                        // transmit new connection to web app's websocket
                        let connection = {
                            mac: mac,
                            timestamp: timestamp,
                            ip: ip,
                            alias: alias,
                            connected: '1'
                        };
                        this.io.sockets.emit('new connection', connection);
                        return res.status(200).send(connection);
                    });
            });
    };

    // REMOVE a connection (DELETE /api/connections)
    this.removeConnection = (req, res) => {
        let mac = req.body.mac;
        redisClient.hset(mac, 'connected', '0', (err, reply) => {
            if (err) return res.status(400).send();
            if (reply !== 0) return res.status(401).send();
            // transmit disconnection to web apps websocket
            io.sockets.emit('disconnection', {
                mac: mac
            });
            return res.status(200).send();
        });
    };
};

module.exports = ConnectionHandler;
