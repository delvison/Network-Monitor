

var bodyParser = require('body-parser');
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
var fs = require('fs')
var app = express();
app.set('view engine', 'pug')


var connections_file = "../connected_file.json"

// setup bodyparser
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// set up port
var port = process.env.PORT || 3000;

// get an instance of the express Router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    // console.log("+ " + req.ip + " - " + req.headers['user-agent']);
    next(); // make sure we go to the next routes and don't stop here
});

// test route (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({
        message: 'its working!'
    });
});

router.route('/whoshome')

    // ADD a connection (/api/whoshome)
    .post(function(req, res) {
        var mac = req.body.mac
        var alias = req.body.alias
        var timestamp = req.body.timestamp
        // load JSON from file
        fs.readFile(connections_file, 'utf8', function(err, data) {
            if (err) throw err
            var tmp = {}
            tmp.MAC = mac
            tmp.alias = alias
            tmp.timestamp = timestamp
            var obj = JSON.parse(data)
            // TODO: debug for async flow
            for (var i = 0; i < obj.connections.length; i++) {
                var connection = obj.connections[i]
                // console.log(connection.MAC);
                if (connection.MAC === tmp.MAC) {
                    obj.connections.splice(i, i)
                    write(JSON.stringify(obj, null, 4))
                }
            }
            obj.connections.push(tmp)
            data = JSON.stringify(obj, null, 4)
            // write back to file
            fs.writeFile(connections_file, data, function(err) {
                if (err) throw err
                res.json(obj)
            })
        })
    })

    // DELETE a connection (/api/whoshome)
    .delete(function(req, res) {
        var mac = req.body.mac
        fs.readFile(connections_file, 'utf8', function(err, data) {
            if (err) throw err
            var obj = JSON.parse(data)

            // console.log(JSON.stringify(obj));

            for (var i = 0; i < obj.connections.length; i++) {
                var connection = obj.connections[i]
                // console.log(connection.MAC);
                if (connection.MAC === mac) {
                    obj.connections.splice(i, i)
                    write(JSON.stringify(obj, null, 4))
                }
            }
            // write back to file
            function write(x) {
                fs.writeFile(connections_file, x, function(err) {
                    if (err) throw err
                    res.json(x)
                })
            }
        })
    })


    // GET all connections (/api/whoshome)
    .get(function(req, res) {
      fs.readFile(connections_file, 'utf8', function(err, data) {
        if (err) throw err
        var obj = JSON.parse(data)
        // res.json(obj)
        // TODO: render view
        res.render( 'index', obj )
      })
    })



// REGISTER OUR ROUTES. all of our routes will be prefixed with /api
app.use('/api', router);

// checks if json obj is empty
function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
}

// START THE SERVER
app.listen(port);
console.log('Running on port ' + port);
