'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Association = mongoose.model('Association'),
	_ = require('lodash');

/**
 * Create a Association
 */
exports.create = function(req, res) {
	var association = new Association(req.body);
	association.user = req.user;

	association.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(association);
		}
	});
};

/**
 * Show the current Association
 */
exports.read = function(req, res) {
	res.jsonp(req.association);
};

/**
 * Update a Association
 */
exports.update = function(req, res) {
	var association = req.association ;

	association = _.extend(association , req.body);

	association.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(association);
		}
	});
};

/**
 * Delete an Association
 */
exports.delete = function(req, res) {
	var association = req.association ;

	association.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(association);
		}
	});
};

/**
 * List of Associations
 */
exports.list = function(req, res) { 
	Association.find().sort('-created').populate('user', 'displayName').exec(function(err, associations) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(associations);
		}
	});
};

/**
 * Association middleware
 */
exports.associationByID = function(req, res, next, id) { 
	Association.findById(id).populate('user', 'displayName').exec(function(err, association) {
		if (err) return next(err);
		if (! association) return next(new Error('Failed to load Association ' + id));
		req.association = association ;
		next();
	});
};

/**
 * Association authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.association.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
