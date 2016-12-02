'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var associations = require('../../app/controllers/associations.server.controller');

	// Associations Routes
	app.route('/associations')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), associations.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), associations.create);

	app.route('/associations/:associationId')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), associations.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), associations.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), associations.delete);

	// Finish by binding the Association middleware
	app.param('associationId', associations.associationByID);
};
