'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var grapetypes = require('../../app/controllers/grapetypes.server.controller');

	// Grapetypes Routes
	app.route('/grapetypes')
		.get(/*users.requiresLogin, */grapetypes.list)
		.post(/*users.requiresLogin, */grapetypes.create);

	app.route('/grapetypes/:grapetypeId')
		.get(/*users.requiresLogin, */grapetypes.read)
		.put(/*users.requiresLogin, grapetypes.hasAuthorization, */grapetypes.update)
		.delete(/*users.requiresLogin, grapetypes.hasAuthorization, */grapetypes.delete);

	// Finish by binding the Grapetype middleware
	app.param('grapetypeId', grapetypes.grapetypeByID);
};
