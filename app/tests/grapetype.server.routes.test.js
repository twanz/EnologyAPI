'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Grapetype = mongoose.model('Grapetype'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, grapetype;

/**
 * Grapetype routes tests
 */
describe('Grapetype CRUD tests', function() {
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

		// Save a user to the test db and create new Grapetype
		user.save(function() {
			grapetype = {
				name: 'Grapetype Name'
			};

			done();
		});
	});

	it('should be able to save Grapetype instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Grapetype
				agent.post('/grapetypes')
					.send(grapetype)
					.expect(200)
					.end(function(grapetypeSaveErr, grapetypeSaveRes) {
						// Handle Grapetype save error
						if (grapetypeSaveErr) done(grapetypeSaveErr);

						// Get a list of Grapetypes
						agent.get('/grapetypes')
							.end(function(grapetypesGetErr, grapetypesGetRes) {
								// Handle Grapetype save error
								if (grapetypesGetErr) done(grapetypesGetErr);

								// Get Grapetypes list
								var grapetypes = grapetypesGetRes.body;

								// Set assertions
								(grapetypes[0].user._id).should.equal(userId);
								(grapetypes[0].name).should.match('Grapetype Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Grapetype instance if not logged in', function(done) {
		agent.post('/grapetypes')
			.send(grapetype)
			.expect(401)
			.end(function(grapetypeSaveErr, grapetypeSaveRes) {
				// Call the assertion callback
				done(grapetypeSaveErr);
			});
	});

	it('should not be able to save Grapetype instance if no name is provided', function(done) {
		// Invalidate name field
		grapetype.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Grapetype
				agent.post('/grapetypes')
					.send(grapetype)
					.expect(400)
					.end(function(grapetypeSaveErr, grapetypeSaveRes) {
						// Set message assertion
						(grapetypeSaveRes.body.message).should.match('Please fill Grapetype name');
						
						// Handle Grapetype save error
						done(grapetypeSaveErr);
					});
			});
	});

	it('should be able to update Grapetype instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Grapetype
				agent.post('/grapetypes')
					.send(grapetype)
					.expect(200)
					.end(function(grapetypeSaveErr, grapetypeSaveRes) {
						// Handle Grapetype save error
						if (grapetypeSaveErr) done(grapetypeSaveErr);

						// Update Grapetype name
						grapetype.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Grapetype
						agent.put('/grapetypes/' + grapetypeSaveRes.body._id)
							.send(grapetype)
							.expect(200)
							.end(function(grapetypeUpdateErr, grapetypeUpdateRes) {
								// Handle Grapetype update error
								if (grapetypeUpdateErr) done(grapetypeUpdateErr);

								// Set assertions
								(grapetypeUpdateRes.body._id).should.equal(grapetypeSaveRes.body._id);
								(grapetypeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Grapetypes if not signed in', function(done) {
		// Create new Grapetype model instance
		var grapetypeObj = new Grapetype(grapetype);

		// Save the Grapetype
		grapetypeObj.save(function() {
			// Request Grapetypes
			request(app).get('/grapetypes')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Grapetype if not signed in', function(done) {
		// Create new Grapetype model instance
		var grapetypeObj = new Grapetype(grapetype);

		// Save the Grapetype
		grapetypeObj.save(function() {
			request(app).get('/grapetypes/' + grapetypeObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', grapetype.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Grapetype instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Grapetype
				agent.post('/grapetypes')
					.send(grapetype)
					.expect(200)
					.end(function(grapetypeSaveErr, grapetypeSaveRes) {
						// Handle Grapetype save error
						if (grapetypeSaveErr) done(grapetypeSaveErr);

						// Delete existing Grapetype
						agent.delete('/grapetypes/' + grapetypeSaveRes.body._id)
							.send(grapetype)
							.expect(200)
							.end(function(grapetypeDeleteErr, grapetypeDeleteRes) {
								// Handle Grapetype error error
								if (grapetypeDeleteErr) done(grapetypeDeleteErr);

								// Set assertions
								(grapetypeDeleteRes.body._id).should.equal(grapetypeSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Grapetype instance if not signed in', function(done) {
		// Set Grapetype user 
		grapetype.user = user;

		// Create new Grapetype model instance
		var grapetypeObj = new Grapetype(grapetype);

		// Save the Grapetype
		grapetypeObj.save(function() {
			// Try deleting Grapetype
			request(app).delete('/grapetypes/' + grapetypeObj._id)
			.expect(401)
			.end(function(grapetypeDeleteErr, grapetypeDeleteRes) {
				// Set message assertion
				(grapetypeDeleteRes.body.message).should.match('User is not logged in');

				// Handle Grapetype error error
				done(grapetypeDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Grapetype.remove().exec();
		done();
	});
});