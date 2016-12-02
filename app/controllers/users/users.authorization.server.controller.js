'use strict';


/**
 * Module dependencies.
 */
var _ = require('lodash'),
        errorHandler = require('../errors.server.controller'),
        config = require('../../../config/config'),
	mongoose = require('mongoose'),
        jwt = require('jsonwebtoken'),
	User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		next();
	});
};

/**
 * Require login routing middleware
 */
/*exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
};*/
exports.requiresLogin = function(req, res, next) {
    var token = req.headers['x-access-token'];

    if (token){
	jwt.verify(token, config.secret, function(err, decoded){
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		req.decoded = decoded;
		next();
	    }
	});
    } else {
	return res.status(403).send({message: 'No token has been provided.'});
    }
};


/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
		    if (_.intersection(req.decoded.roles, roles).length) {
			return next();
		    } else {
			return res.status(403).send({
			    message: 'Unauthorized access.'
			});
		    }
		});
	};
};
