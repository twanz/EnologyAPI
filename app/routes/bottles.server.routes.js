'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var bottles = require('../../app/controllers/bottles.server.controller');
    
    // Bottles Routes
    
    app.route('/bottles')
	.get(users.requiresLogin, bottles.list)
	.post(users.requiresLogin, users.hasAuthorization(['admin']), bottles.create);
    
    app.route('/bottles/:bottleId')
	.get(users.requiresLogin, bottles.read)
	.put(users.requiresLogin, users.hasAuthorization(['admin']), bottles.update)
	.delete(users.requiresLogin, users.hasAuthorization(['admin']), bottles.delete);

    app.route('/bottles/:bottleId/comments')
	.post(users.requiresLogin, bottles.postComment);

    app.route('/bottles/:bottleId/comments/:commentId')
	.put(users.requiresLogin, bottles.isAuthor, bottles.updateComment)
	.delete(users.requiresLogin, bottles.isAuthor, bottles.deleteComment);
    //app.route('/bottles/byname/:bottleName').get(bottles.read);
    
    // Finish by binding the Bottle middleware
    // app.param('bottleName', bottles.bottleByName);
    app.param('bottleId', bottles.bottleByID);
    app.param('commentId', bottles.commentByID);
};
