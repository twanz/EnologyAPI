'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Region = mongoose.model('Region'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, region;

/**
 * Region routes tests
 */
describe('Region CRUD tests', function() {
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

		// Save a user to the test db and create new Region
		user.save(function() {
			region = {
				name: 'Region Name'
			};

			done();
		});
	});

	it('should be able to save Region instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Region
				agent.post('/regions')
					.send(region)
					.expect(200)
					.end(function(regionSaveErr, regionSaveRes) {
						// Handle Region save error
						if (regionSaveErr) done(regionSaveErr);

						// Get a list of Regions
						agent.get('/regions')
							.end(function(regionsGetErr, regionsGetRes) {
								// Handle Region save error
								if (regionsGetErr) done(regionsGetErr);

								// Get Regions list
								var regions = regionsGetRes.body;

								// Set assertions
								(regions[0].user._id).should.equal(userId);
								(regions[0].name).should.match('Region Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Region instance if not logged in', function(done) {
		agent.post('/regions')
			.send(region)
			.expect(401)
			.end(function(regionSaveErr, regionSaveRes) {
				// Call the assertion callback
				done(regionSaveErr);
			});
	});

	it('should not be able to save Region instance if no name is provided', function(done) {
		// Invalidate name field
		region.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Region
				agent.post('/regions')
					.send(region)
					.expect(400)
					.end(function(regionSaveErr, regionSaveRes) {
						// Set message assertion
						(regionSaveRes.body.message).should.match('Please fill Region name');
						
						// Handle Region save error
						done(regionSaveErr);
					});
			});
	});

	it('should be able to update Region instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Region
				agent.post('/regions')
					.send(region)
					.expect(200)
					.end(function(regionSaveErr, regionSaveRes) {
						// Handle Region save error
						if (regionSaveErr) done(regionSaveErr);

						// Update Region name
						region.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Region
						agent.put('/regions/' + regionSaveRes.body._id)
							.send(region)
							.expect(200)
							.end(function(regionUpdateErr, regionUpdateRes) {
								// Handle Region update error
								if (regionUpdateErr) done(regionUpdateErr);

								// Set assertions
								(regionUpdateRes.body._id).should.equal(regionSaveRes.body._id);
								(regionUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Regions if not signed in', function(done) {
		// Create new Region model instance
		var regionObj = new Region(region);

		// Save the Region
		regionObj.save(function() {
			// Request Regions
			request(app).get('/regions')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Region if not signed in', function(done) {
		// Create new Region model instance
		var regionObj = new Region(region);

		// Save the Region
		regionObj.save(function() {
			request(app).get('/regions/' + regionObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', region.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Region instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Region
				agent.post('/regions')
					.send(region)
					.expect(200)
					.end(function(regionSaveErr, regionSaveRes) {
						// Handle Region save error
						if (regionSaveErr) done(regionSaveErr);

						// Delete existing Region
						agent.delete('/regions/' + regionSaveRes.body._id)
							.send(region)
							.expect(200)
							.end(function(regionDeleteErr, regionDeleteRes) {
								// Handle Region error error
								if (regionDeleteErr) done(regionDeleteErr);

								// Set assertions
								(regionDeleteRes.body._id).should.equal(regionSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Region instance if not signed in', function(done) {
		// Set Region user 
		region.user = user;

		// Create new Region model instance
		var regionObj = new Region(region);

		// Save the Region
		regionObj.save(function() {
			// Try deleting Region
			request(app).delete('/regions/' + regionObj._id)
			.expect(401)
			.end(function(regionDeleteErr, regionDeleteRes) {
				// Set message assertion
				(regionDeleteRes.body.message).should.match('User is not logged in');

				// Handle Region error error
				done(regionDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Region.remove().exec();
		done();
	});
});