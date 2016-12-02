'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var caves = require('../../app/controllers/caves.server.controller');

	// Caves Routes
//	var canListCaves = auth.can('list caves');

//TODO re-secure routes after JWT implementation

	app.route('/caves')
		.get(users.requiresLogin, users.hasAuthorization(['admin']), caves.list)
		.post(users.requiresLogin, caves.create);

	app.route('/caves/:caveId')
		.get(users.requiresLogin, caves.hasAuthorization, caves.read)
		.put(users.requiresLogin, caves.hasAuthorization, caves.update)
		.delete(users.requiresLogin, caves.hasAuthorization, caves.delete);

	app.route('/caves/:caveId/myBottles')
	        .get(users.requiresLogin, caves.hasAuthorization, caves.listMyBottles)
                .post(users.requiresLogin, caves.hasAuthorization, caves.addMyBottle);

        app.route('/caves/:caveId/myBottles/:myBottleId')
                .get(users.requiresLogin, caves.hasAuthorization, caves.readMyBottle)
	        .put(users.requiresLogin, caves.hasAuthorization, caves.updateMyBottle)
                .patch(users.requiresLogin, caves.hasAuthorization, caves.markMyBottle)
                .delete(users.requiresLogin, caves.hasAuthorization, caves.deleteMyBottle);
    
    app.route('/cave')
	.get(users.requiresLogin, caves.myCave);

    // Finish by binding the Cave middleware
	app.param('caveId', caves.caveByID);
        app.param('myBottleId', caves.myBottleByID);
};
