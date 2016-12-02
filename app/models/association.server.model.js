'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Association Schema
 */
var AssociationSchema = new Schema({

        /*grapetype: {
	    type: Schema.ObjectId,
	    ref: 'Grapetype'
        },*/

        grapetype: {
	    type: String,
	    default: '',
	    trim: true
	},

        mains: [{
	    type: String,
	    required: true
	}],

        tags: [{
	    type: String,
	    required: true
	}],

	created: {
	    type: Date,
	    default: Date.now
	},

	user: {
	    type: Schema.ObjectId,
	    ref: 'User'
	}
});

mongoose.model('Association', AssociationSchema);
