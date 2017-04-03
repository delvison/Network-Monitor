// server.js

// dependencies
var bodyParser = require('body-parser');
var express = require('express')
var fs = require('fs')
var logger = require("morgan")
var redis = require("redis")
var app = express();
var server = require('http').createServer(app)

// websocket
var WebSocket = require('./my_modules/websocket')
var io = require('socket.io').listen(server);
io = new WebSocket(io);


// http authentication
var auth = require("basic-auth")
var admins = {
    'admin': {
        password: 'password'
    }
}

// view engine
app.set('view engine', 'pug')

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// public folder
app.use(express.static(__dirname + '/public'));

// morgan logger
app.use(logger('dev', {
    stream: fs.createWriteStream('./access.log', {
        flags: 'a'
    })
}))

// redis
var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('Redis server connected')
})
redisClient.on("error", function(err) {
    console.error("Error connecting to redis", err);
    process.exit(1);
});

// API's
ApiConnections = require('./routes/api_connections')

// register API routes
app.use('/api', ApiConnections.connections_router(redisClient, io));

// index page
app.get('/', function(req, res) {
    var user = auth(req)
    if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Network Monitor')
        return res.status(401).send();
    } else {
        ApiConnections.get_connections(redisClient, function(err, connections) {
            res.render('index', {
                connections: connections
            })

        })
    }
})

// START THE SERVER
server.listen(3000);
console.log('Running on port 3000');
