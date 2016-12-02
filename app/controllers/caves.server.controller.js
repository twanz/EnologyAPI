'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
errorHandler = require('./errors.server.controller'),
MyBottle = mongoose.model('MyBottle'),
Bottle = mongoose.model('Bottle'),
Domain = mongoose.model('Domain'),
Cave = mongoose.model('Cave'),
User = mongoose.model('User'),
_ = require('lodash');

/**
 * Create a Cave
 */
exports.create = function(req, res) {
    var cave = new Cave(req.body);
    cave.user = new User(req.decoded);
    
    cave.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(cave);
	}
    });
};

/**
 * Show the current Cave
 */
exports.read = function(req, res) {
    res.jsonp(req.cave);
};

/**
 * Update a Cave
 */
exports.update = function(req, res) {
    var cave = req.cave ;
    
    cave = _.extend(cave , req.body);
    
    cave.save(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(cave);
	}
    });
};

/**
 * Delete a Cave
 */
exports.delete = function(req, res) {
    var cave = req.cave ;
    
    cave.remove(function(err) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(cave);
	}
    });
};

/**
 * List of Caves
 */
exports.list = function(req, res) { 
    Cave.find().sort('-created').populate('user', 'displayName').exec(function(err, caves) {
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    res.jsonp(caves);
	}
    });
};

/**
 * Cave middleware
 */
exports.caveByID = function(req, res, next, id) { 
    Cave.findOne({_id:id}).populate('user myBottles').exec(function(err, cave) {
	if (err) return next(err);
	if (! cave) return next(new Error('Failed to load Cave ' + id));
	req.cave = cave ;
	next();
    });
};

exports.Statcave = function(req, res, cave) {

	var tmp='';
	var r = 0;
	var w = 0;
	var ro = 0;
	var price = 0;
	var nb_consumed = 0;
	var nb_open_bottle = 0;
	var cur_most_exp_bottle = '';
	var cur_most_exp_bottle_price = -1;
	var cur_most_exp_bottle_id = '';
	var cur_oldest_bottle = '';
	var cur_oldest_bottle_id = '';
	var cur_oldest_bottle_year = 3000;
	var past_oldest_bottle_id = '';
	var past_oldest_bottle = '';
	var past_oldest_botlle_year= 3000;
	var past_most_exp_bottle_id = '';
	var past_most_exp_bottle = '';
	var past_most_exp_bottle_price = -1;
	var bottle_consumed_id = [];
	var bottle_id = [];
	var millesime_exist = false;
	var millesime = {
		year:[],
		nb_per_year:[]
	};
	for (var i = 0; i < cave.myBottles.length; i++) {
		if (cave.myBottles[i].year) {
			for (var x = 0; x < millesime.year.length; x++) {
				if (cave.myBottles[i].year === millesime.year[x]) {
					millesime_exist = true;
				}
			}
			if (millesime_exist === false)
				millesime.year.push(cave.myBottles[i].year);
			millesime_exist = false;
		}
		if (cave.myBottles[i].consumed === true) {
			bottle_consumed_id.push(i);
			nb_consumed++;
		}
		else {
			bottle_id.push(i);
		}
	}
	millesime.year = millesime.year.sort();
	// getting nb bottle per year
 	var ct = 0;
	for (var l =0; l < millesime.year.length; l++) {
		for (var k = 0; k < cave.myBottles.length; k++) {
			if (parseInt(millesime.year[l]) === parseInt(cave.myBottles[k].year)) {
				ct++;
			}
		}
		millesime.nb_per_year.push(ct);
		ct = 0;
	}
	/// Current Bottle in Cave
	if (bottle_id.length > 0) {
		for (var y=0; y < bottle_id.length; y++) {
			if (cave.myBottles[bottle_id[y]].type === 'red') {
				r++;
			}
			if (cave.myBottles[bottle_id[y]].type === 'white') {
				w++;
			}
			if (cave.myBottles[bottle_id[y]].type === 'rose') {
				ro++;
			}
			if (cave.myBottles[parseInt(bottle_id[y])].year) { 
				if (parseInt(cave.myBottles[bottle_id[y]].year) < cur_oldest_bottle_year) {
					cur_oldest_bottle_year = cave.myBottles[bottle_id[y]].year;
					cur_oldest_bottle = cave.myBottles[bottle_id[y]].name;
					cur_oldest_bottle_id = cave.myBottles[bottle_id[y]].id;
				}
			}
			if (cave.myBottles[bottle_id[y]].price > -1) {
				price = price + parseFloat(cave.myBottles[bottle_id[y]].price);
				if (parseFloat(cave.myBottles[bottle_id[y]].price) > cur_most_exp_bottle_price) {
						cur_most_exp_bottle_price = cave.myBottles[bottle_id[y]].price;
						cur_most_exp_bottle = cave.myBottles[bottle_id[y]].name;
						cur_most_exp_bottle_id = cave.myBottles[bottle_id[y]].id;
					}
			}
		}
	}
		//// Consumed past Bottle in Cave
		//res.jsonp(cave.myBottles[0].created.getMonth());
		var consumed_white = 0;
		var consumed_rose = 0;
		var consumed_red = 0;
	if (bottle_consumed_id.length > 0) {
		for (var j =0; j < bottle_consumed_id.length; j++)	{
			if (cave.myBottles[bottle_consumed_id[j]].type === 'red') {
				consumed_red++;
			}
			if (cave.myBottles[bottle_consumed_id[j]].type === 'white') {
				consumed_white++;
			}
			if (cave.myBottles[bottle_consumed_id[j]].type === 'rose') {
				consumed_rose++;
			}
			if (cave.myBottles[parseInt(bottle_consumed_id[j])].year) { 
				if (parseInt(cave.myBottles[parseInt(bottle_consumed_id[j])].year) < past_oldest_botlle_year) {
					past_oldest_botlle_year = cave.myBottles[parseInt(bottle_consumed_id[j])].year;
					past_oldest_bottle = cave.myBottles[parseInt(bottle_consumed_id[j])].name;
					past_oldest_bottle_id = cave.myBottles[parseInt(bottle_consumed_id[j])].id;
				}
				if (parseFloat(cave.myBottles[bottle_consumed_id[j]].price) > past_most_exp_bottle_price) {
					past_most_exp_bottle_price = cave.myBottles[bottle_consumed_id[j]].price;
					past_most_exp_bottle = cave.myBottles[bottle_consumed_id[j]].name;
					past_most_exp_bottle_id = cave.myBottles[bottle_consumed_id[j]].id;
				}
			}
		}
	}

	cave.nbr_bottle_open = nb_consumed;
	cave.nbr_bottle = parseInt(cave.myBottles.length) - parseInt(nb_consumed);
	cave.current_most_expensive_bottle = {id: cur_most_exp_bottle_id, name: cur_most_exp_bottle};
	cave.current_oldest_bottle = {id: cur_oldest_bottle_id, name: cur_oldest_bottle};
	cave.past_most_expensive_bottle = {id: past_most_exp_bottle_id, name: past_most_exp_bottle};
	cave.past_oldest_bottle = {id: past_oldest_bottle_id, name: past_oldest_bottle};
	cave.cave_price = price.toFixed(2);
	if (millesime) {
		cave.millesime_per_year = millesime;
	}
	cave.nb_millesime = millesime.year.length;
	if (parseInt(consumed_red) > parseInt(consumed_white)) {
		if (parseInt(consumed_red) > parseInt(consumed_rose)) {
			cave.preferred_type = 'red';
		}
		else {
			cave.preferred_type = 'rose';
		}
	}
	else {
		if (parseInt(consumed_white) > parseInt(consumed_rose)) {
			cave.preferred_type = 'white';
		}
		else {
			cave.preferred_type = 'rose';
		}
	}
	cave.nbr_type_red = r;
	cave.nbr_type_white = w;
	cave.nbr_type_rose = ro;
	
	tmp = parseFloat(cave.cave_price) / parseFloat(cave.nbr_bottle); 
	cave.bottle_price_average = tmp.toFixed(2);
 	cave.save(function(err) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		}
	});
};

exports.saveMyBottle = function(req, res, myBottle, cave) {
    myBottle.user = new User(req.decoded);
    myBottle.cave = cave;
    myBottle.save(function(err){
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {

		/*exports.Statcave(req, res, cave);*/
	    cave.save(function(err) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(myBottle);
		}
	    });
	}
    });
};

exports.addMyBottle = function(req, res) {
    var cave = req.cave;
    var myBottle;
    if (req.body.reference) {
	Bottle.findOne({_id: req.body.reference}).exec(function(err, bottle){
	    if (err) {
		return res.status(400).send({
		    message: errorHandler.getErrorMessage(err)
		});
	    } else if (!bottle) {
		return res.status(400).send({
		    message: 'No database bottle matching id: ' + req.body.reference
		});
	    } else {
		myBottle = new MyBottle(bottle);
		myBottle._id = mongoose.Types.ObjectId();
		exports.saveMyBottle(req, res, myBottle, cave);
		exports.Statcave(req, res, cave);
	    }
	});
    } else {
	myBottle = new MyBottle(req.body);
	exports.saveMyBottle(req, res, myBottle, cave);
	exports.Statcave(req, res, cave);
    }
};

exports.listMyBottles = function(req, res){
    var cave = req.cave;
    res.jsonp(cave.myBottles);
};

exports.myBottleByID = function(req, res, next, id) {
    MyBottle.findOne({_id:id}).populate('domain user comments').exec(function(err, myBottle){
	if (err) return next(err);
	if (! myBottle) return next(new Error('Failed to load Bottle ' + id));
	req.myBottle = myBottle;
	next();
    }); 
};

exports.readMyBottle = function(req, res){
    res.jsonp(req.myBottle);
};

exports.updateMyBottle = function(req, res) {
    var cave = req.cave;
    var myBottle = req.myBottle;

    myBottle = _.extend(myBottle , req.body);    

    myBottle.save(function(err){
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    cave.save(function(err) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(myBottle);
		}
	    });
	}
    });
};

exports.markMyBottle = function(req, res){
    var cave = req.cave;
    var myBottle = req.myBottle;

    myBottle.consumed = !myBottle.consumed;

    myBottle.save(function(err){
	if (err) {
	    return res.status(400).send({
		message: errorHandler.getErrorMessage(err)
	    });
	} else {
	    cave.save(function(err) {
		if (err) {
		    return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		    });
		} else {
		    res.jsonp(myBottle);
		}
	    });
	}
    });
};

exports.deleteMyBottle = function(req, res) {
	var myBottle = req.myBottle ;

	myBottle.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
		    //console.log(res.jsonp(bottle));
			res.jsonp(myBottle);
		}
	});
};

exports.myCave = function(req, res) {
    Cave.findOne({_id:req.decoded.cave}).populate('myBottles').exec(function(err, cave){
	if (!cave)
	    return res.status(400).send({message : 'The current user has no cave.'});
	else
	    res.jsonp(cave);
    });
    
};

/**
 * Cave authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (_.intersection(req.decoded.roles, ['admin']).length)
	next();
    else {
	if (req.cave.user._id.equals(req.decoded._id))
	    next();
	else {
	    return res.status(403).render('403', {
		error: 'Unauthorized'
	    });
	}
    }
};
