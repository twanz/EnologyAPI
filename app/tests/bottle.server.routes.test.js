'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Bottle = mongoose.model('Bottle'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, bottle;

/**
 * Bottle routes tests
 */
describe('Bottle CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Bottle
		user.save(function() {
			bottle = {
				name: 'Bottle Name'
			};

			done();
		});
	});

	it('should be able to save Bottle instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bottle
				agent.post('/bottles')
					.send(bottle)
					.expect(200)
					.end(function(bottleSaveErr, bottleSaveRes) {
						// Handle Bottle save error
						if (bottleSaveErr) done(bottleSaveErr);

						// Get a list of Bottles
						agent.get('/bottles')
							.end(function(bottlesGetErr, bottlesGetRes) {
								// Handle Bottle save error
								if (bottlesGetErr) done(bottlesGetErr);

								// Get Bottles list
								var bottles = bottlesGetRes.body;

								// Set assertions
								(bottles[0].user._id).should.equal(userId);
								(bottles[0].name).should.match('Bottle Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Bottle instance if not logged in', function(done) {
		agent.post('/bottles')
			.send(bottle)
			.expect(401)
			.end(function(bottleSaveErr, bottleSaveRes) {
				// Call the assertion callback
				done(bottleSaveErr);
			});
	});

	it('should not be able to save Bottle instance if no name is provided', function(done) {
		// Invalidate name field
		bottle.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bottle
				agent.post('/bottles')
					.send(bottle)
					.expect(400)
					.end(function(bottleSaveErr, bottleSaveRes) {
						// Set message assertion
						(bottleSaveRes.body.message).should.match('Please fill Bottle name');
						
						// Handle Bottle save error
						done(bottleSaveErr);
					});
			});
	});

	it('should be able to update Bottle instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bottle
				agent.post('/bottles')
					.send(bottle)
					.expect(200)
					.end(function(bottleSaveErr, bottleSaveRes) {
						// Handle Bottle save error
						if (bottleSaveErr) done(bottleSaveErr);

						// Update Bottle name
						bottle.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Bottle
						agent.put('/bottles/' + bottleSaveRes.body._id)
							.send(bottle)
							.expect(200)
							.end(function(bottleUpdateErr, bottleUpdateRes) {
								// Handle Bottle update error
								if (bottleUpdateErr) done(bottleUpdateErr);

								// Set assertions
								(bottleUpdateRes.body._id).should.equal(bottleSaveRes.body._id);
								(bottleUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Bottles if not signed in', function(done) {
		// Create new Bottle model instance
		var bottleObj = new Bottle(bottle);

		// Save the Bottle
		bottleObj.save(function() {
			// Request Bottles
			request(app).get('/bottles')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Bottle if not signed in', function(done) {
		// Create new Bottle model instance
		var bottleObj = new Bottle(bottle);

		// Save the Bottle
		bottleObj.save(function() {
			request(app).get('/bottles/' + bottleObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', bottle.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Bottle instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bottle
				agent.post('/bottles')
					.send(bottle)
					.expect(200)
					.end(function(bottleSaveErr, bottleSaveRes) {
						// Handle Bottle save error
						if (bottleSaveErr) done(bottleSaveErr);

						// Delete existing Bottle
						agent.delete('/bottles/' + bottleSaveRes.body._id)
							.send(bottle)
							.expect(200)
							.end(function(bottleDeleteErr, bottleDeleteRes) {
								// Handle Bottle error error
								if (bottleDeleteErr) done(bottleDeleteErr);

								// Set assertions
								(bottleDeleteRes.body._id).should.equal(bottleSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Bottle instance if not signed in', function(done) {
		// Set Bottle user 
		bottle.user = user;

		// Create new Bottle model instance
		var bottleObj = new Bottle(bottle);

		// Save the Bottle
		bottleObj.save(function() {
			// Try deleting Bottle
			request(app).delete('/bottles/' + bottleObj._id)
			.expect(401)
			.end(function(bottleDeleteErr, bottleDeleteRes) {
				// Set message assertion
				(bottleDeleteRes.body.message).should.match('User is not logged in');

				// Handle Bottle error error
				done(bottleDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Bottle.remove().exec();
		done();
	});
});