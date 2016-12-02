'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * News Schema
 */
var NewsSchema = new Schema({
    created: {
	type: Date,
    default: Date.now
    },
    title: {
	type: String,
	required: 'Please provide a title.',
	trim: true
    },
    newsType: {
	type: String,
	enum: ['enology', 'food', 'wine'],
	required: 'Please indicate news type.',
	trim: true
    },
    body: {
	type: String,
	default: '',
	trim: true
    },
    imgurl: {
	type: String,
	default: ''
    }
});

mongoose.model('News', NewsSchema);
