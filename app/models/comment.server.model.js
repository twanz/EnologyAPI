'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    user: {
	type: Schema.ObjectId,
	ref: 'User'
    },
    title: {
	type: String,
	required: 'Please give your comment a title.',
	trim: true
    },
    body: {
	type: String,
	required: 'Please write your comment.',
	trim: true
    },
    created: {
	type: Date,
	default: Date.now
    },
    bottle: {
	type: Schema.ObjectId,
	ref: 'Bottle',
	childPath: 'comments'
    }
});
CommentSchema.plugin(relationship, {relationshipPathName : 'bottle'});
mongoose.model('Comment', CommentSchema);
