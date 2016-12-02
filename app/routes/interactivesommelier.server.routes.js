'use strict';

var passport = require('passport');

module.exports = function(app) {
    var sommelier = require('../../app/controllers/interactivesommelier.server.controller');
    var bottles = require('../../app/controllers/bottles.server.controller');
    var recipes = require('../../app/controllers/recipes.server.controller');
    var users = require('../../app/controllers/users.server.controller');
    
    app.route('/sommelier/wine')
	.get(users.requiresLogin, users.hasAuthorization(['admin']), sommelier.listRequestsForWine)
        .post(users.requiresLogin, sommelier.getWine);
    app.route('/sommelier/recipe')
	.get(users.requiresLogin, users.hasAuthorization(['admin']), sommelier.listRequestsForRecipe)
        .post(users.requiresLogin, sommelier.getRecipe);
};
