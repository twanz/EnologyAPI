'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Grapetype = mongoose.model('Grapetype'),
	_ = require('lodash');

/**
 * Create a Grapetype
 */
exports.create = function(req, res) {
	var grapetype = new Grapetype(req.body);
	grapetype.user = req.user;

	grapetype.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(grapetype);
		}
	});
};

/**
 * Show the current Grapetype
 */
exports.read = function(req, res) {
	res.jsonp(req.grapetype);
};

/**
 * Update a Grapetype
 */
exports.update = function(req, res) {
	var grapetype = req.grapetype ;

	grapetype = _.extend(grapetype , req.body);

	grapetype.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(grapetype);
		}
	});
};

/**
 * Delete an Grapetype
 */
exports.delete = function(req, res) {
	var grapetype = req.grapetype ;

	grapetype.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(grapetype);
		}
	});
};

/**
 * List of Grapetypes
 */
exports.list = function(req, res) { 
	Grapetype.find().sort('-created').populate('user', 'displayName').exec(function(err, grapetypes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(grapetypes);
		}
	});
};

/**
 * Grapetype middleware
 */
exports.grapetypeByID = function(req, res, next, id) { 
	Grapetype.findById(id).populate('user', 'displayName').exec(function(err, grapetype) {
		if (err) return next(err);
		if (! grapetype) return next(new Error('Failed to load Grapetype ' + id));
		req.grapetype = grapetype ;
		next();
	});
};

/**
 * Grapetype authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.grapetype.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
