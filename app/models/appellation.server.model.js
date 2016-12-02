'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	relationship = require('mongoose-relationship');
/**
 * Appellation Schema
 */
var AppellationSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Appellation name',
		trim: true
	},
	desc: {
		type: String,
		default: '',
		trim: true
	},
	region: {
		type: Schema.ObjectId,
		ref: 'Region',
		childPath: 'appellations'
	},
	domains: [{
		type: Schema.ObjectId,
		ref: 'Domain'
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
AppellationSchema.plugin(relationship, { relationshipPathName : 'region' });
mongoose.model('Appellation', AppellationSchema);