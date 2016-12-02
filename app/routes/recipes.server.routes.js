'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var recipes = require('../../app/controllers/recipes.server.controller');

	// Recipes Routes
	app.route('/recipes')
		.get(users.requiresLogin, recipes.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), recipes.create);

	app.route('/recipes/:recipeId')
		.get(users.requiresLogin, recipes.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), recipes.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), recipes.delete);

//        app.route('/recipes/byname/:recipeName')
//	        .get(recipes.read);

        app.route('/recipes/search/:recipeName')
                .get(users.requiresLogin, recipes.listSearchResults);
	// Finish by binding the Recipe middleware
        app.param('recipeName', recipes.recipeByName);
	app.param('recipeId', recipes.recipeByID);
};
