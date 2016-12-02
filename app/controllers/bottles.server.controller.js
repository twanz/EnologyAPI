'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Bottle = mongoose.model('Bottle'),
    Domain = mongoose.model('Domain'),
    Appellation = mongoose.model('Appellation'),
    Comment = mongoose.model('Comment'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Create a Bottle
 */
exports.create = function(req, res) {
	var bottle = new Bottle(req.body);
	bottle.user = req.user;

	bottle.save(function(err) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
			});
		} else {
		    //		    console.log(res.jsonp(bottle));
		    res.jsonp(bottle);
		}
	});
};

/**
 * Show the current Bottle
 */
exports.read = function(req, res) {
//    console.log(res.jsonp(req.bottle));
    res.jsonp(req.bottle);
};

/**
 * Update a Bottle
 */
exports.update = function(req, res) {
	var bottle = req.bottle ;

	bottle = _.extend(bottle , req.body);

	bottle.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
//		    console.log(res.jsonp(bottle));
			res.jsonp(bottle);
		}
	});
};

/**
 * Delete an Bottle
 */
exports.delete = function(req, res) {
	var bottle = req.bottle ;

	bottle.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
		    //console.log(res.jsonp(bottle));
			res.jsonp(bottle);
		}
	});
};

/**
 * List of Bottles
 */
exports.list = function(req, res) { 
/*	Bottle.find().sort('-created').populate('user', 'displayName').exec(function(err, bottles) {
**		if (err) {
**			return res.status(400).send({
**				message: errorHandler.getErrorMessage(err)
**			});
**		} else {
**		    //console.log(res.jsonp(bottles));
**			res.jsonp(bottles);
**		}
**	});
*/
    Bottle.find().sort('-created').populate('domain', 'appellation city').select('name year desc domain price').exec(function(err, bottles) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
		 /*   Appellation.populate(bottles, {
			path: 'domain.appellation',
			select: 'name'
		    });*/
		    //console.log(res.jsonp(bottles));
			res.jsonp(bottles);
		}
	});
};

exports.postComment = function(req, res) {
    var bottle = req.bottle;
    var comment = new Comment(req.body);

    comment.user = new User(req.decoded);
    comment.bottle = bottle;
    comment.save(function(err){
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    bottle.save(function(err){
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(comment);
		}
	    });
	}
    });
 
};

exports.updateComment = function(req, res) {
    var bottle = req.bottle;
    var comment = req.comment;

    comment = _.extend(comment, req.body);

    comment.save(function(err){
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    bottle.save(function(err){
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(comment);
		}
	    });
	}
    });
};

exports.deleteComment = function(req, res) {
    var comment = req.comment;

    comment.remove(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else
	    res.jsonp(comment);
    });
};

exports.bottleByName = function(req, res, next, name) {
    Bottle.findOne({'name':name}).exec(function(err, bottle) {
	if (err) return next(err);
	if (! bottle) return next(new Error('Failed to load Bottle ' + name));
	req.bottle = bottle ;
	next();
});
};


/**
 * Bottle middleware
 */
exports.bottleByID = function(req, res, next, id) { 
	Bottle.findById(id).populate('domain user comments').exec(function(err, bottle) {
		if (err) return next(err);
		if (! bottle) return next(new Error('Failed to load Bottle ' + id));
		req.bottle = bottle ;
		next();
	});
};

/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {
    Comment.findOne({_id:id}).populate('user', '_id').exec(function(err, comment){
	if (err) return next(err);
	if (!comment) return next(new Error('Failed to load comment ' + id));
	req.comment = comment;
	next();
    });
};

/**
 * Bottle authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.bottle.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.isAuthor = function(req, res, next) {
    if (_.intersection(req.decoded.roles, ['admin']).length)
	next();
    else {
	if (req.comment.user._id.equals(req.decoded._id))
	    next();
	else
	    return res.status(403).send('User is not authorized');
    }
};
