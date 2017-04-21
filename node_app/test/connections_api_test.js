let testConfig = require('./config/config.json');
let connectionData = require('./config/sample_connection.json');

let chakram = require('chakram'),
		expect = chakram.expect;

// GET all connections
describe("Get all connections", function(){
	it("should get status 200 for fetching all connections", function(){
		let response = chakram.get(testConfig.connections_api);
		return expect(response).to.have.status(200);
	});
});


// ADD a connection
describe("Add a connection", function(){
	it("should get status 200 for adding a connection", function(){
		return chakram.post(testConfig.connections_api, connectionData)
		.then(res => {
			expect(res).to.have.status(200);
		} );
	});
});

// REMOVE a connection
describe("Remove a connection", function(){
	it("should get status 200 for removing a connection", function(){
		return chakram.delete(testConfig.connections_api, {"mac":"11:22:33:44:55:66"})
		.then(res => {
			expect(res).to.have.status(200);
		} );
	});
});
