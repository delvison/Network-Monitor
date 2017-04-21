// routes.js


function init_routes(app, handlers) {
	app.get('/test', (req, res) => { res.status(200).send("hello world"); });
	app.get('/api/connections',handlers.connections.getAll);
	app.post('/api/connections',handlers.connections.addConnection);
	app.delete('/api/connections',handlers.connections.removeConnection);
}

exports.init_routes = init_routes;
