'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Grapetype Schema
 */
var GrapetypeSchema = new Schema({
	name: {
	    type: String,
	    default: '',
	    required: 'Please fill Grapetype name',
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

mongoose.model('Grapetype', GrapetypeSchema);
