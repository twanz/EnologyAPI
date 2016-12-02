'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var news = require('../../app/controllers/news.server.controller');

	// News Routes
	app.route('/news')
		.get(users.requiresLogin, news.list)
		.post(users.requiresLogin, users.hasAuthorization(['admin']), news.create);

	app.route('/news/:newsId')
		.get(users.requiresLogin, news.read)
		.put(users.requiresLogin, users.hasAuthorization(['admin']), news.update)
		.delete(users.requiresLogin, users.hasAuthorization(['admin']), news.delete);

	// Finish by binding the News middleware
	app.param('newsId', news.newsByID);
};
