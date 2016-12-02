'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var textSearch = require('mongoose-text-search');

/**
 * Recipe Schema
 */
var RecipeSchema = new Schema({
	name: {
	    type: String,
	    default: '',
	    required: 'Please fill Recipe name',
	    trim: true
	},
         
        main: {
	    type: String,
	    default: '',
	    required: 'Please fill main foodstuff',
	    trim: true
	},

        tags: [{
	    type: String,
	    required: true
	}],
         
        desc: {
	    type: String,
	    default: '',
	    trim: true
	},
    
        imgurl: {
	    type: String, 
	    default: '',
	    trim: true
        },
	
        created: {
	    type: Date,
	    default: Date.now
	},
	
        user: {
	    type: Schema.ObjectId,
	    ref: 'User'
	}
});
RecipeSchema.plugin(textSearch);
RecipeSchema.index({name: 'text'});
mongoose.model('Recipe', RecipeSchema);
