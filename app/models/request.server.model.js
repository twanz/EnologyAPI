'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');
    

/**
 * Request Schema
 */
var RequestSchema = new Schema({
    reqType: {
        type: String,
	enum: ['recipe', 'wine'],
        required: 'Please indicate request type (recipe or wine)',
        trim: true
    },
    
    extended: {
	type: Boolean,
	required: true,
	default: false
    },
    
    param: {
	recipe: {
	    type: Schema.ObjectId,
	    ref: 'Recipe'

    },
	bottle: {
	    type: Schema.ObjectId,
	    ref: 'Bottle'
	},
	myBottle: {
	    type: Schema.ObjectId,
	    ref: 'myBottle'
	}
    },

    results: {
	recipes: [{
	    type: Schema.ObjectId,
	    ref: 'Recipe'
	}],
	bottles: [{
	    type: Schema.ObjectId,
	    ref: 'Bottle'
	}],
	myBottles: [{
	    type: Schema.ObjectId,
	    ref: 'myBottle'
	}]

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

mongoose.model('Request', RequestSchema);
