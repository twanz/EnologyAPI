'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var appellations = require('../../app/controllers/appellations.server.controller');

	// Appellations Routes
	app.route('/appellations')
		.get(users.requiresLogin, appellations.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), appellations.create);

	app.route('/appellations/:appellationId')
	        .get(users.requiresLogin, appellations.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), appellations.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), appellations.delete);

	// Finish by binding the Appellation middleware
	app.param('appellationId', appellations.appellationByID);
};
