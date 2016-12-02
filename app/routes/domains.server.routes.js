'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var domains = require('../../app/controllers/domains.server.controller');

	// Domains Routes
	app.route('/domains')
		.get(users.requiresLogin, domains.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), domains.create);

	app.route('/domains/:domainId')
		.get(users.requiresLogin, domains.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), domains.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), domains.delete);

	// Finish by binding the Domain middleware
	app.param('domainId', domains.domainByID);
};
