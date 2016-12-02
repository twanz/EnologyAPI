'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Foodstuff = mongoose.model('Foodstuff'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, foodstuff;

/**
 * Foodstuff routes tests
 */
describe('Foodstuff CRUD tests', function() {
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

		// Save a user to the test db and create new Foodstuff
		user.save(function() {
			foodstuff = {
				name: 'Foodstuff Name'
			};

			done();
		});
	});

	it('should be able to save Foodstuff instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Foodstuff
				agent.post('/foodstuffs')
					.send(foodstuff)
					.expect(200)
					.end(function(foodstuffSaveErr, foodstuffSaveRes) {
						// Handle Foodstuff save error
						if (foodstuffSaveErr) done(foodstuffSaveErr);

						// Get a list of Foodstuffs
						agent.get('/foodstuffs')
							.end(function(foodstuffsGetErr, foodstuffsGetRes) {
								// Handle Foodstuff save error
								if (foodstuffsGetErr) done(foodstuffsGetErr);

								// Get Foodstuffs list
								var foodstuffs = foodstuffsGetRes.body;

								// Set assertions
								(foodstuffs[0].user._id).should.equal(userId);
								(foodstuffs[0].name).should.match('Foodstuff Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Foodstuff instance if not logged in', function(done) {
		agent.post('/foodstuffs')
			.send(foodstuff)
			.expect(401)
			.end(function(foodstuffSaveErr, foodstuffSaveRes) {
				// Call the assertion callback
				done(foodstuffSaveErr);
			});
	});

	it('should not be able to save Foodstuff instance if no name is provided', function(done) {
		// Invalidate name field
		foodstuff.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Foodstuff
				agent.post('/foodstuffs')
					.send(foodstuff)
					.expect(400)
					.end(function(foodstuffSaveErr, foodstuffSaveRes) {
						// Set message assertion
						(foodstuffSaveRes.body.message).should.match('Please fill Foodstuff name');
						
						// Handle Foodstuff save error
						done(foodstuffSaveErr);
					});
			});
	});

	it('should be able to update Foodstuff instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Foodstuff
				agent.post('/foodstuffs')
					.send(foodstuff)
					.expect(200)
					.end(function(foodstuffSaveErr, foodstuffSaveRes) {
						// Handle Foodstuff save error
						if (foodstuffSaveErr) done(foodstuffSaveErr);

						// Update Foodstuff name
						foodstuff.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Foodstuff
						agent.put('/foodstuffs/' + foodstuffSaveRes.body._id)
							.send(foodstuff)
							.expect(200)
							.end(function(foodstuffUpdateErr, foodstuffUpdateRes) {
								// Handle Foodstuff update error
								if (foodstuffUpdateErr) done(foodstuffUpdateErr);

								// Set assertions
								(foodstuffUpdateRes.body._id).should.equal(foodstuffSaveRes.body._id);
								(foodstuffUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Foodstuffs if not signed in', function(done) {
		// Create new Foodstuff model instance
		var foodstuffObj = new Foodstuff(foodstuff);

		// Save the Foodstuff
		foodstuffObj.save(function() {
			// Request Foodstuffs
			request(app).get('/foodstuffs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Foodstuff if not signed in', function(done) {
		// Create new Foodstuff model instance
		var foodstuffObj = new Foodstuff(foodstuff);

		// Save the Foodstuff
		foodstuffObj.save(function() {
			request(app).get('/foodstuffs/' + foodstuffObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', foodstuff.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Foodstuff instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Foodstuff
				agent.post('/foodstuffs')
					.send(foodstuff)
					.expect(200)
					.end(function(foodstuffSaveErr, foodstuffSaveRes) {
						// Handle Foodstuff save error
						if (foodstuffSaveErr) done(foodstuffSaveErr);

						// Delete existing Foodstuff
						agent.delete('/foodstuffs/' + foodstuffSaveRes.body._id)
							.send(foodstuff)
							.expect(200)
							.end(function(foodstuffDeleteErr, foodstuffDeleteRes) {
								// Handle Foodstuff error error
								if (foodstuffDeleteErr) done(foodstuffDeleteErr);

								// Set assertions
								(foodstuffDeleteRes.body._id).should.equal(foodstuffSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Foodstuff instance if not signed in', function(done) {
		// Set Foodstuff user 
		foodstuff.user = user;

		// Create new Foodstuff model instance
		var foodstuffObj = new Foodstuff(foodstuff);

		// Save the Foodstuff
		foodstuffObj.save(function() {
			// Try deleting Foodstuff
			request(app).delete('/foodstuffs/' + foodstuffObj._id)
			.expect(401)
			.end(function(foodstuffDeleteErr, foodstuffDeleteRes) {
				// Set message assertion
				(foodstuffDeleteRes.body.message).should.match('User is not logged in');

				// Handle Foodstuff error error
				done(foodstuffDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Foodstuff.remove().exec();
		done();
	});
});