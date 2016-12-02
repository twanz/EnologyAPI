'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;


/**
 * Origin Schema
 */
var OriginSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Origin name',
        trim: true
    },
    desc: {
        type: String,
        default: '',
        trim: true
    },
    regions: [{
        type: Schema.ObjectId,
        ref: 'Region' 
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

mongoose.model('Origin', OriginSchema);