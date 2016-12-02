'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var foodstuffs = require('../../app/controllers/foodstuffs.server.controller');

	// Foodstuffs Routes
	app.route('/foodstuffs')
		.get(foodstuffs.list)
		.post(/*users.requiresLogin, */foodstuffs.create);

	app.route('/foodstuffs/:foodstuffId')
		.get(foodstuffs.read)
		.put(/*users.requiresLogin, foodstuffs.hasAuthorization, */foodstuffs.update)
		.delete(/*users.requiresLogin, foodstuffs.hasAuthorization, */foodstuffs.delete);

	// Finish by binding the Foodstuff middleware
	app.param('foodstuffId', foodstuffs.foodstuffByID);
};
