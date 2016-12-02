'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Foodstuff = mongoose.model('Foodstuff'),
	_ = require('lodash');

/**
 * Create a Foodstuff
 */
exports.create = function(req, res) {
	var foodstuff = new Foodstuff(req.body);
	foodstuff.user = req.user;

	foodstuff.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(foodstuff);
		}
	});
};

/**
 * Show the current Foodstuff
 */
exports.read = function(req, res) {
	res.jsonp(req.foodstuff);
};

/**
 * Update a Foodstuff
 */
exports.update = function(req, res) {
	var foodstuff = req.foodstuff ;

	foodstuff = _.extend(foodstuff , req.body);

	foodstuff.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(foodstuff);
		}
	});
};

/**
 * Delete an Foodstuff
 */
exports.delete = function(req, res) {
	var foodstuff = req.foodstuff ;

	foodstuff.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(foodstuff);
		}
	});
};

/**
 * List of Foodstuffs
 */
exports.list = function(req, res) { 
	Foodstuff.find().sort('-created').populate('user', 'displayName').exec(function(err, foodstuffs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(foodstuffs);
		}
	});
};

/**
 * Foodstuff middleware
 */
exports.foodstuffByID = function(req, res, next, id) { 
	Foodstuff.findById(id).populate('user', 'displayName').exec(function(err, foodstuff) {
		if (err) return next(err);
		if (! foodstuff) return next(new Error('Failed to load Foodstuff ' + id));
		req.foodstuff = foodstuff ;
		next();
	});
};

/**
 * Foodstuff authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.foodstuff.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
