'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Cave = mongoose.model('Cave'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, cave;

/**
 * Cave routes tests
 */
describe('Cave CRUD tests', function() {
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

		// Save a user to the test db and create new Cave
		user.save(function() {
			cave = {
				name: 'Cave Name'
			};

			done();
		});
	});

	it('should be able to save Cave instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cave
				agent.post('/caves')
					.send(cave)
					.expect(200)
					.end(function(caveSaveErr, caveSaveRes) {
						// Handle Cave save error
						if (caveSaveErr) done(caveSaveErr);

						// Get a list of Caves
						agent.get('/caves')
							.end(function(cavesGetErr, cavesGetRes) {
								// Handle Cave save error
								if (cavesGetErr) done(cavesGetErr);

								// Get Caves list
								var caves = cavesGetRes.body;

								// Set assertions
								(caves[0].user._id).should.equal(userId);
								(caves[0].name).should.match('Cave Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Cave instance if not logged in', function(done) {
		agent.post('/caves')
			.send(cave)
			.expect(401)
			.end(function(caveSaveErr, caveSaveRes) {
				// Call the assertion callback
				done(caveSaveErr);
			});
	});

	it('should not be able to save Cave instance if no name is provided', function(done) {
		// Invalidate name field
		cave.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cave
				agent.post('/caves')
					.send(cave)
					.expect(400)
					.end(function(caveSaveErr, caveSaveRes) {
						// Set message assertion
						(caveSaveRes.body.message).should.match('Please fill Cave name');
						
						// Handle Cave save error
						done(caveSaveErr);
					});
			});
	});

	it('should be able to update Cave instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cave
				agent.post('/caves')
					.send(cave)
					.expect(200)
					.end(function(caveSaveErr, caveSaveRes) {
						// Handle Cave save error
						if (caveSaveErr) done(caveSaveErr);

						// Update Cave name
						cave.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Cave
						agent.put('/caves/' + caveSaveRes.body._id)
							.send(cave)
							.expect(200)
							.end(function(caveUpdateErr, caveUpdateRes) {
								// Handle Cave update error
								if (caveUpdateErr) done(caveUpdateErr);

								// Set assertions
								(caveUpdateRes.body._id).should.equal(caveSaveRes.body._id);
								(caveUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Caves if not signed in', function(done) {
		// Create new Cave model instance
		var caveObj = new Cave(cave);

		// Save the Cave
		caveObj.save(function() {
			// Request Caves
			request(app).get('/caves')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Cave if not signed in', function(done) {
		// Create new Cave model instance
		var caveObj = new Cave(cave);

		// Save the Cave
		caveObj.save(function() {
			request(app).get('/caves/' + caveObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', cave.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Cave instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cave
				agent.post('/caves')
					.send(cave)
					.expect(200)
					.end(function(caveSaveErr, caveSaveRes) {
						// Handle Cave save error
						if (caveSaveErr) done(caveSaveErr);

						// Delete existing Cave
						agent.delete('/caves/' + caveSaveRes.body._id)
							.send(cave)
							.expect(200)
							.end(function(caveDeleteErr, caveDeleteRes) {
								// Handle Cave error error
								if (caveDeleteErr) done(caveDeleteErr);

								// Set assertions
								(caveDeleteRes.body._id).should.equal(caveSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Cave instance if not signed in', function(done) {
		// Set Cave user 
		cave.user = user;

		// Create new Cave model instance
		var caveObj = new Cave(cave);

		// Save the Cave
		caveObj.save(function() {
			// Try deleting Cave
			request(app).delete('/caves/' + caveObj._id)
			.expect(401)
			.end(function(caveDeleteErr, caveDeleteRes) {
				// Set message assertion
				(caveDeleteRes.body.message).should.match('User is not logged in');

				// Handle Cave error error
				done(caveDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Cave.remove().exec();
		done();
	});
});