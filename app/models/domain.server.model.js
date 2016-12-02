'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	relationship = require('mongoose-relationship');

/**
 * Domain Schema
 */
var DomainSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Domain name',
		trim: true
	},
	desc: {
		type: String,
		default: '',
		trim: true
	},
	owner: {
		type: String,
		default: '',
		trim:true
	},
	address: {
		type: String,
		default: '',
		trim: true
	},
	city: {
		type: String,
		default: '',
		trim: true
	},
	zipcode: {
		type: String,
		default: '',
		trim: true
	},
	appellation: {
		type: Schema.ObjectId,
		ref: 'Appellation',
		childPath: 'domains'
	},
	bottles: [{
		type: Schema.ObjectId,
		ref: 'Bottle'
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

DomainSchema.plugin(relationship, { relationshipPathName : 'appellation' });
mongoose.model('Domain', DomainSchema);