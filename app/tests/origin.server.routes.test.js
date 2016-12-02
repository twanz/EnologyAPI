'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Origin = mongoose.model('Origin'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, origin;

/**
 * Origin routes tests
 */
describe('Origin CRUD tests', function() {
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

		// Save a user to the test db and create new Origin
		user.save(function() {
			origin = {
				name: 'Origin Name'
			};

			done();
		});
	});

	it('should be able to save Origin instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Origin
				agent.post('/origins')
					.send(origin)
					.expect(200)
					.end(function(originSaveErr, originSaveRes) {
						// Handle Origin save error
						if (originSaveErr) done(originSaveErr);

						// Get a list of Origins
						agent.get('/origins')
							.end(function(originsGetErr, originsGetRes) {
								// Handle Origin save error
								if (originsGetErr) done(originsGetErr);

								// Get Origins list
								var origins = originsGetRes.body;

								// Set assertions
								(origins[0].user._id).should.equal(userId);
								(origins[0].name).should.match('Origin Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Origin instance if not logged in', function(done) {
		agent.post('/origins')
			.send(origin)
			.expect(401)
			.end(function(originSaveErr, originSaveRes) {
				// Call the assertion callback
				done(originSaveErr);
			});
	});

	it('should not be able to save Origin instance if no name is provided', function(done) {
		// Invalidate name field
		origin.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Origin
				agent.post('/origins')
					.send(origin)
					.expect(400)
					.end(function(originSaveErr, originSaveRes) {
						// Set message assertion
						(originSaveRes.body.message).should.match('Please fill Origin name');
						
						// Handle Origin save error
						done(originSaveErr);
					});
			});
	});

	it('should be able to update Origin instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Origin
				agent.post('/origins')
					.send(origin)
					.expect(200)
					.end(function(originSaveErr, originSaveRes) {
						// Handle Origin save error
						if (originSaveErr) done(originSaveErr);

						// Update Origin name
						origin.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Origin
						agent.put('/origins/' + originSaveRes.body._id)
							.send(origin)
							.expect(200)
							.end(function(originUpdateErr, originUpdateRes) {
								// Handle Origin update error
								if (originUpdateErr) done(originUpdateErr);

								// Set assertions
								(originUpdateRes.body._id).should.equal(originSaveRes.body._id);
								(originUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Origins if not signed in', function(done) {
		// Create new Origin model instance
		var originObj = new Origin(origin);

		// Save the Origin
		originObj.save(function() {
			// Request Origins
			request(app).get('/origins')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Origin if not signed in', function(done) {
		// Create new Origin model instance
		var originObj = new Origin(origin);

		// Save the Origin
		originObj.save(function() {
			request(app).get('/origins/' + originObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', origin.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Origin instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Origin
				agent.post('/origins')
					.send(origin)
					.expect(200)
					.end(function(originSaveErr, originSaveRes) {
						// Handle Origin save error
						if (originSaveErr) done(originSaveErr);

						// Delete existing Origin
						agent.delete('/origins/' + originSaveRes.body._id)
							.send(origin)
							.expect(200)
							.end(function(originDeleteErr, originDeleteRes) {
								// Handle Origin error error
								if (originDeleteErr) done(originDeleteErr);

								// Set assertions
								(originDeleteRes.body._id).should.equal(originSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Origin instance if not signed in', function(done) {
		// Set Origin user 
		origin.user = user;

		// Create new Origin model instance
		var originObj = new Origin(origin);

		// Save the Origin
		originObj.save(function() {
			// Try deleting Origin
			request(app).delete('/origins/' + originObj._id)
			.expect(401)
			.end(function(originDeleteErr, originDeleteRes) {
				// Set message assertion
				(originDeleteRes.body.message).should.match('User is not logged in');

				// Handle Origin error error
				done(originDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Origin.remove().exec();
		done();
	});
});