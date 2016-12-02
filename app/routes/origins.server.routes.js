'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var origins = require('../../app/controllers/origins.server.controller');

	// Origins Routes
	app.route('/origins')
		.get(users.requiresLogin, origins.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), origins.create);

	app.route('/origins/:originId')
		.get(users.requiresLogin, origins.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), origins.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), origins.delete);

	// Finish by binding the Origin middleware
	app.param('originId', origins.originByID);
};
