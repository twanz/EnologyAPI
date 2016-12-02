'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Appellation = mongoose.model('Appellation'),
	_ = require('lodash');

/**
 * Create a Appellation
 */
exports.create = function(req, res) {
	var appellation = new Appellation(req.body);
	appellation.user = req.user;

	appellation.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(appellation);
		}
	});
};

/**
 * Show the current Appellation
 */
exports.read = function(req, res) {
	res.jsonp(req.appellation);
};

/**
 * Update a Appellation
 */
exports.update = function(req, res) {
	var appellation = req.appellation ;

	appellation = _.extend(appellation , req.body);

	appellation.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(appellation);
		}
	});
};

/**
 * Delete an Appellation
 */
exports.delete = function(req, res) {
	var appellation = req.appellation ;

	appellation.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(appellation);
		}
	});
};

/**
 * List of Appellations
 */
exports.list = function(req, res) { 
	Appellation.find().sort({name:1}).populate('user', 'displayName').exec(function(err, appellations) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(appellations);
		}
	});
};

/**
 * Appellation middleware
 */
exports.appellationByID = function(req, res, next, id) { 
	Appellation.findById(id).populate('region domains user').exec(function(err, appellation) {
		if (err) return next(err);
		if (! appellation) return next(new Error('Failed to load Appellation ' + id));
		req.appellation = appellation ;
		next();
	});
};

/**
 * Appellation authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.appellation.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
