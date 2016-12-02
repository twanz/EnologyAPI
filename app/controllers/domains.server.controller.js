'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Domain = mongoose.model('Domain'),
	_ = require('lodash');

/**
 * Create a Domain
 */
exports.create = function(req, res) {
	var domain = new Domain(req.body);
	domain.user = req.user;

	domain.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(domain);
		}
	});
};

/**
 * Show the current Domain
 */
exports.read = function(req, res) {
	res.jsonp(req.domain);
};

/**
 * Update a Domain
 */
exports.update = function(req, res) {
	var domain = req.domain ;

	domain = _.extend(domain , req.body);

	domain.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(domain);
		}
	});
};

/**
 * Delete an Domain
 */
exports.delete = function(req, res) {
	var domain = req.domain ;

	domain.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(domain);
		}
	});
};

/**
 * List of Domains
 */
exports.list = function(req, res) { 
	Domain.find().sort('-created').populate('user', 'displayName').exec(function(err, domains) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(domains);
		}
	});
};

/**
 * Domain middleware
 */
exports.domainByID = function(req, res, next, id) { 
	Domain.findById(id).populate('appellation bottles user').exec(function(err, domain) {
		if (err) return next(err);
		if (! domain) return next(new Error('Failed to load Domain ' + id));
		req.domain = domain ;
		next();
	});
};

/**
 * Domain authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.domain.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
