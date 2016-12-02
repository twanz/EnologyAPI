'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
        Request = mongoose.model('Request'),
        Recipe = mongoose.model('Recipe'),
        Bottle = mongoose.model('Bottle'),
        MyBottle = mongoose.model('MyBottle'),
        Association = mongoose.model('Association'),
    _ = require('lodash');


exports.listRequestsForWine = function(req, res){
    Request.find({reqType: 'wine'}).sort('-created').populate('user', 'displayName').exec(function(err, requests) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(requests);
	}
    });
};

exports.listRequestsForRecipe = function(req, res){
    Request.find({reqType: 'recipe'}).sort('-created').populate('user', 'displayName').exec(function(err, requests) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(requests);
	}
    });
};

exports.getWine = function(req, res){
    var request = new Request(req.body);
    request.user = req.user;
    if (!request.param.recipe)
	return res.status(400).send({message : 'please specify recipe parameter.'});    
    Recipe.findOne({_id:request.param.recipe}).exec(function(err, recipe) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    Association.find({mains: recipe.main}).exec(function(err, association){
		if (err){
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		    
		} else if (!association || association.length === 0){
		    res.jsonp('No association has been found for this recipe.');
		} else {
		    var maxMatches = 0;
		    var bestAsso = association[0];
		    for(var i = 0, len = association.length; i < len; ++i) {
			
			for (var j = 0, tagMatches = 0, lengh = association[i].tags.length; j < lengh; ++j){
			    if (_.contains(recipe.tags, association[i].tags[j])) {
				tagMatches++;
			    }
			}
			if (tagMatches > maxMatches) {
			    maxMatches = tagMatches;
			    bestAsso = association[i];
			}
		    }
		    if (request.extended === false)
		    {
			MyBottle.find().and([{cave: req.decoded.cave}, {grapetype: bestAsso.grapetype}]).sort('-grade').exec(function(err, Bottle) {
			    if (err){
				return res.status(400).send({
				    message: errorHandler.getErrorMessage(err)});
			    }
			    else {
				request.results.myBottles = Bottle;
				request.save(function(err) {
				    if (err) {
					console.log(errorHandler.getErrorMessage(err));
					return res.status(400).send({
					    message: errorHandler.getErrorMessage(err)});
				    }
				    else {
					res.jsonp(request);
				    }
				});
			    }
			});
		    }
		    else
		    {
			Bottle.find({grapetype: bestAsso.grapetype}).sort('-grade').exec(function(err, Bottle) {
			    if (err){
				return res.status(400).send({
				    message: errorHandler.getErrorMessage(err)});
			    }
			    else {
				request.results.bottles = Bottle;
				request.save(function(err) {
				    if (err) {
					console.log(errorHandler.getErrorMessage(err));
					return res.status(400).send({
					    message: errorHandler.getErrorMessage(err)});
				    }
				    else {
					res.jsonp(request);
				    }
				});
			    }
			});
		    }
		}		    
	    });
	}
    });
};

exports.getRecipe = function(req, res){
    var request = new Request(req.body);
    request.user = req.user;

/*    if (!request.extended)*/
//	wine = request.param.myBottle;
/*    else */
//    wine = request.param.bottle;
    if ((request.extended === true) && (!request.param.bottle))
	return res.status(400).send({message : 'Please specify extended bottle parameter.'});
    else if ((request.extended === false) && (!request.param.myBottle))
	return res.status(400).send({message : 'Please specify non-extended bottle parameter.'});
    Bottle.findOne({_id:request.param.bottle}).exec(function(err, bottle){
	Association.findOne({grapetype: bottle.grapetype}).exec(function(err, association){
	    if (err){
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else {
		if (!association)
		    res.jsonp('No association has been found for this bottle.');
		else {
		    Recipe.find({ main: { $in: association.mains}}).exec(function(err, recipes){
			var maxMatches = 0;
			var bestCandidate;
			for (var i = 0, len = recipes.length; i < len; ++i){
			    for (var j = 0, tagMatches = 0, len2 = recipes[i].tags.length; j < len2; ++j){
				if (_.contains(association.tags, recipes[i].tags[j]))
				    tagMatches++;
			    }
			    if (tagMatches > maxMatches) {
				maxMatches = tagMatches;
				bestCandidate = recipes[i];
			    }
			}
			request.results.recipes.push(bestCandidate);
			request.save(function(err) {
			    if (err) {
				return res.status(400).send({
				    message: errorHandler.getErrorMessage(err)
				});
			    } else {
				res.jsonp(request);
			    }
			});	
		    });
		}
	    }
	});
    });
};

