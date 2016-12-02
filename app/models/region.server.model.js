'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');


/**
 * Region Schema
 */
var RegionSchema = new Schema({
    name: {
	   type: String,
        default: '',
	   required: 'Please fill Region name',
	   trim: true
    },
    desc: {
	   type: String,
        default: '',
	   trim: true
    },
    origin: {
        type: Schema.ObjectId,
        ref: 'Origin',
        childPath: 'regions'
    },
    appellations: [{
        type: Schema.ObjectId,
        ref: 'Appellation'
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

RegionSchema.plugin(relationship, { relationshipPathName : 'origin' });
mongoose.model('Region', RegionSchema);