'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Foodstuff Schema
 */
var FoodstuffSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Foodstuff name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Foodstuff', FoodstuffSchema);