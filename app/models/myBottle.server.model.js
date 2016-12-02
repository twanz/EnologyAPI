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
var MyBottleSchema = new Schema({
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
        /*type: Schema.ObjectId,
        ref: 'Grapetype'*/
	type: String,
	default: '',
	trim: true
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

    domain: {
	type: Schema.ObjectId,
	ref: 'Domain',
	childPath: 'bottles'
    },
    created: {
	type: Date,
        default: Date.now
    },
    optimaldate: {
	type: Date,
	default: Date.now
    },
    consumed: {
	type: Boolean,
	default: false
    },
    user: {
	type: Schema.ObjectId,
	ref: 'User'
    },
    comments: [{
	type: Schema.ObjectId,
	ref: 'Comment'
    }],
    cave: {
	type: Schema.ObjectId,
	ref: 'Cave',
	childPath: 'myBottles'
    }
});
MyBottleSchema.plugin(relationship, { relationshipPathName : 'cave' });
mongoose.model('MyBottle', MyBottleSchema);
