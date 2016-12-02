'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Association = mongoose.model('Association'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, association;

/**
 * Association routes tests
 */
describe('Association CRUD tests', function() {
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

		// Save a user to the test db and create new Association
		user.save(function() {
			association = {
				name: 'Association Name'
			};

			done();
		});
	});

	it('should be able to save Association instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Association
				agent.post('/associations')
					.send(association)
					.expect(200)
					.end(function(associationSaveErr, associationSaveRes) {
						// Handle Association save error
						if (associationSaveErr) done(associationSaveErr);

						// Get a list of Associations
						agent.get('/associations')
							.end(function(associationsGetErr, associationsGetRes) {
								// Handle Association save error
								if (associationsGetErr) done(associationsGetErr);

								// Get Associations list
								var associations = associationsGetRes.body;

								// Set assertions
								(associations[0].user._id).should.equal(userId);
								(associations[0].name).should.match('Association Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Association instance if not logged in', function(done) {
		agent.post('/associations')
			.send(association)
			.expect(401)
			.end(function(associationSaveErr, associationSaveRes) {
				// Call the assertion callback
				done(associationSaveErr);
			});
	});

	it('should not be able to save Association instance if no name is provided', function(done) {
		// Invalidate name field
		association.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Association
				agent.post('/associations')
					.send(association)
					.expect(400)
					.end(function(associationSaveErr, associationSaveRes) {
						// Set message assertion
						(associationSaveRes.body.message).should.match('Please fill Association name');
						
						// Handle Association save error
						done(associationSaveErr);
					});
			});
	});

	it('should be able to update Association instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Association
				agent.post('/associations')
					.send(association)
					.expect(200)
					.end(function(associationSaveErr, associationSaveRes) {
						// Handle Association save error
						if (associationSaveErr) done(associationSaveErr);

						// Update Association name
						association.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Association
						agent.put('/associations/' + associationSaveRes.body._id)
							.send(association)
							.expect(200)
							.end(function(associationUpdateErr, associationUpdateRes) {
								// Handle Association update error
								if (associationUpdateErr) done(associationUpdateErr);

								// Set assertions
								(associationUpdateRes.body._id).should.equal(associationSaveRes.body._id);
								(associationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Associations if not signed in', function(done) {
		// Create new Association model instance
		var associationObj = new Association(association);

		// Save the Association
		associationObj.save(function() {
			// Request Associations
			request(app).get('/associations')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Association if not signed in', function(done) {
		// Create new Association model instance
		var associationObj = new Association(association);

		// Save the Association
		associationObj.save(function() {
			request(app).get('/associations/' + associationObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', association.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Association instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Association
				agent.post('/associations')
					.send(association)
					.expect(200)
					.end(function(associationSaveErr, associationSaveRes) {
						// Handle Association save error
						if (associationSaveErr) done(associationSaveErr);

						// Delete existing Association
						agent.delete('/associations/' + associationSaveRes.body._id)
							.send(association)
							.expect(200)
							.end(function(associationDeleteErr, associationDeleteRes) {
								// Handle Association error error
								if (associationDeleteErr) done(associationDeleteErr);

								// Set assertions
								(associationDeleteRes.body._id).should.equal(associationSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Association instance if not signed in', function(done) {
		// Set Association user 
		association.user = user;

		// Create new Association model instance
		var associationObj = new Association(association);

		// Save the Association
		associationObj.save(function() {
			// Try deleting Association
			request(app).delete('/associations/' + associationObj._id)
			.expect(401)
			.end(function(associationDeleteErr, associationDeleteRes) {
				// Set message assertion
				(associationDeleteRes.body.message).should.match('User is not logged in');

				// Handle Association error error
				done(associationDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Association.remove().exec();
		done();
	});
});