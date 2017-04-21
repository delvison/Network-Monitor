// server.js

// dependencies
let bodyParser = require('body-parser');
let express = require('express');
let fs = require('fs');
let logger = require("morgan");
let redis = require("redis");
let app = express();
let server = require('http').createServer(app);

// websocket
let WebSocket = require('./my_modules/websocket');
let io = require('socket.io').listen(server);
io = new WebSocket(io);


// http authentication
let auth = require("basic-auth");
let admins = { // define admins here
    'admin': { password: 'password' }
};

// view engine
app.set('view engine', 'pug');

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// public folder
app.use(express.static(__dirname + '/public'));

// morgan logger
app.use(logger('dev', {
    stream: fs.createWriteStream('./access.log', {
        flags: 'a'
    })
}));

// redis (for docker: ('6379', 'redis') )
let redisClient = redis.createClient('6379', 'redis');
redisClient.on('connect', function() { console.log('Redis server connected'); });
redisClient.on("error", function(err) {
    console.error("Error connecting to redis", err);
    process.exit(1);
});

// API handlers 
let ConnectionHandler = require('./routes/ConnectionHandler.js');
		ConnectionHandler = new ConnectionHandler(redisClient, io);
let handlers = {
	connections: ConnectionHandler
};

// ROUTES
let routes = require('./routes/routes.js');
routes.init_routes(app, handlers);

// index page
app.get('/', function(req, res) {
    let user = auth(req);
    if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Network Monitor');
        return res.status(401).send();
    } else {
        ConnectionHandler.get_connections(redisClient, function(err, connections) {
            res.render('index', {
                connections: connections
            });
        });
    }
});

// START THE SERVER
server.listen(3000);
console.log('Running on port 3000');
