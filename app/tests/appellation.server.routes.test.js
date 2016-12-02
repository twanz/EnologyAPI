'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Appellation = mongoose.model('Appellation'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, appellation;

/**
 * Appellation routes tests
 */
describe('Appellation CRUD tests', function() {
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

		// Save a user to the test db and create new Appellation
		user.save(function() {
			appellation = {
				name: 'Appellation Name'
			};

			done();
		});
	});

	it('should be able to save Appellation instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Appellation
				agent.post('/appellations')
					.send(appellation)
					.expect(200)
					.end(function(appellationSaveErr, appellationSaveRes) {
						// Handle Appellation save error
						if (appellationSaveErr) done(appellationSaveErr);

						// Get a list of Appellations
						agent.get('/appellations')
							.end(function(appellationsGetErr, appellationsGetRes) {
								// Handle Appellation save error
								if (appellationsGetErr) done(appellationsGetErr);

								// Get Appellations list
								var appellations = appellationsGetRes.body;

								// Set assertions
								(appellations[0].user._id).should.equal(userId);
								(appellations[0].name).should.match('Appellation Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Appellation instance if not logged in', function(done) {
		agent.post('/appellations')
			.send(appellation)
			.expect(401)
			.end(function(appellationSaveErr, appellationSaveRes) {
				// Call the assertion callback
				done(appellationSaveErr);
			});
	});

	it('should not be able to save Appellation instance if no name is provided', function(done) {
		// Invalidate name field
		appellation.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Appellation
				agent.post('/appellations')
					.send(appellation)
					.expect(400)
					.end(function(appellationSaveErr, appellationSaveRes) {
						// Set message assertion
						(appellationSaveRes.body.message).should.match('Please fill Appellation name');
						
						// Handle Appellation save error
						done(appellationSaveErr);
					});
			});
	});

	it('should be able to update Appellation instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Appellation
				agent.post('/appellations')
					.send(appellation)
					.expect(200)
					.end(function(appellationSaveErr, appellationSaveRes) {
						// Handle Appellation save error
						if (appellationSaveErr) done(appellationSaveErr);

						// Update Appellation name
						appellation.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Appellation
						agent.put('/appellations/' + appellationSaveRes.body._id)
							.send(appellation)
							.expect(200)
							.end(function(appellationUpdateErr, appellationUpdateRes) {
								// Handle Appellation update error
								if (appellationUpdateErr) done(appellationUpdateErr);

								// Set assertions
								(appellationUpdateRes.body._id).should.equal(appellationSaveRes.body._id);
								(appellationUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Appellations if not signed in', function(done) {
		// Create new Appellation model instance
		var appellationObj = new Appellation(appellation);

		// Save the Appellation
		appellationObj.save(function() {
			// Request Appellations
			request(app).get('/appellations')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Appellation if not signed in', function(done) {
		// Create new Appellation model instance
		var appellationObj = new Appellation(appellation);

		// Save the Appellation
		appellationObj.save(function() {
			request(app).get('/appellations/' + appellationObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', appellation.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Appellation instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Appellation
				agent.post('/appellations')
					.send(appellation)
					.expect(200)
					.end(function(appellationSaveErr, appellationSaveRes) {
						// Handle Appellation save error
						if (appellationSaveErr) done(appellationSaveErr);

						// Delete existing Appellation
						agent.delete('/appellations/' + appellationSaveRes.body._id)
							.send(appellation)
							.expect(200)
							.end(function(appellationDeleteErr, appellationDeleteRes) {
								// Handle Appellation error error
								if (appellationDeleteErr) done(appellationDeleteErr);

								// Set assertions
								(appellationDeleteRes.body._id).should.equal(appellationSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Appellation instance if not signed in', function(done) {
		// Set Appellation user 
		appellation.user = user;

		// Create new Appellation model instance
		var appellationObj = new Appellation(appellation);

		// Save the Appellation
		appellationObj.save(function() {
			// Try deleting Appellation
			request(app).delete('/appellations/' + appellationObj._id)
			.expect(401)
			.end(function(appellationDeleteErr, appellationDeleteRes) {
				// Set message assertion
				(appellationDeleteRes.body.message).should.match('User is not logged in');

				// Handle Appellation error error
				done(appellationDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Appellation.remove().exec();
		done();
	});
});