'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');
    

/**
 * Bottle Schema
 */
var BottleSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Bottle name',
        trim: true
    },
    type: {
        type: String,
        enum: ['red', 'white', 'rose'],
        default: 'red',
        required: 'Please fill Bottle type: red, white, rose',
        trim: true
    },
    desc: {
        type: String,
        default: '',
        trim: true
    },
    year: {
        type: String,
        default: '',
        trim: true
    },
    cru: {
        type: String,
        default: '',
        trim: true
    },
    grapetype: {
       /* type: Schema.ObjectId,
        ref: 'Grapetype'*/
	type: String,
	default: '',
        trim: true
    },
    domain: {
	   type: Schema.ObjectId,
	   ref: 'Domain',
       childPath: 'bottles'
    },

    price: {
	type: String,
	default: '0.00',
	trim: true
    },

    grade: {
	type: Number,
	min: 0,
	max: 5,
	default: 0
    },
    comments: [{
	type: Schema.ObjectId,
	ref: 'Comment'
    }],
    
    created: {
	type: Date,
	default: Date.now
    },
    vendorUrl:{
	type: String,
	default: '',
	trim: true
    },
    user: {
	type: Schema.ObjectId,
	ref: 'User'
    }
});
BottleSchema.plugin(relationship, { relationshipPathName : 'domain' });
mongoose.model('Bottle', BottleSchema);
