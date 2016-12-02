'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var regions = require('../../app/controllers/regions.server.controller');

	// Regions Routes
	app.route('/regions')
		.get(users.requiresLogin, regions.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), regions.create);

	app.route('/regions/:regionId')
		.get(users.requiresLogin, regions.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), regions.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), regions.delete);

	// Finish by binding the Region middleware
	app.param('regionId', regions.regionByID);
};
