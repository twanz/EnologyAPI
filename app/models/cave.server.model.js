'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	relationship = require('mongoose-relationship');

/**
 * Cave Schema
 */
var CaveSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Cave name',
		trim: true
	},
	myBottles: [{
		type: Schema.ObjectId,
                ref: 'MyBottle'
	}],
	nbr_bottle: {
		type:String,
		default:'0',
		trim:false
	},
	nbr_type_red: {
		type:String,
		default:'0',
		trim:false
	},
	nbr_type_white: {
		type:String,
		default:'0',
		trim:false
	},
	nbr_type_rose :	{ 
		type:String,
		default:'0',
		trim:false
	},
	nbr_bottle_open: {
		type:String,
		default:'0',
		trim:false	
	},
	cave_price: {
		type:String,
		default:'0.00',
		trim:false
	},
	preferred_type: {
		type:String,
		default:'red',
		trim:false
	},
	millesime_per_year: {
		type:Object, default:null, trim:false
	},
	nb_millesime: {
		type:String,
		default:'',
		trim: false
	},
	current_oldest_bottle: {
		id: { type:String, default:'',trim:false},
		name: { type:String, default:'', trim:false}
	},
	current_most_expensive_bottle: {		
		id: { type:String, default:'',trim:false},
		name: { type:String, default:'', trim:false}
	},
	past_oldest_bottle: {
		id: { type:String, default:'',trim:false},
		name: { type:String, default:'', trim:false}
	},
	past_most_expensive_bottle: {
		id: { type:String, default:'',trim:false},
		name: { type:String, default:'', trim:false}
	},
	bottle_price_average: {
		type:String,
		default:'100000',
		trim:false
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		childPath: 'cave'
	}
});
CaveSchema.plugin(relationship, { relationshipPathName : 'user' });
mongoose.model('Cave', CaveSchema);
