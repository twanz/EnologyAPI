'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Domain = mongoose.model('Domain'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, domain;

/**
 * Domain routes tests
 */
describe('Domain CRUD tests', function() {
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

		// Save a user to the test db and create new Domain
		user.save(function() {
			domain = {
				name: 'Domain Name'
			};

			done();
		});
	});

	it('should be able to save Domain instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Domain
				agent.post('/domains')
					.send(domain)
					.expect(200)
					.end(function(domainSaveErr, domainSaveRes) {
						// Handle Domain save error
						if (domainSaveErr) done(domainSaveErr);

						// Get a list of Domains
						agent.get('/domains')
							.end(function(domainsGetErr, domainsGetRes) {
								// Handle Domain save error
								if (domainsGetErr) done(domainsGetErr);

								// Get Domains list
								var domains = domainsGetRes.body;

								// Set assertions
								(domains[0].user._id).should.equal(userId);
								(domains[0].name).should.match('Domain Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Domain instance if not logged in', function(done) {
		agent.post('/domains')
			.send(domain)
			.expect(401)
			.end(function(domainSaveErr, domainSaveRes) {
				// Call the assertion callback
				done(domainSaveErr);
			});
	});

	it('should not be able to save Domain instance if no name is provided', function(done) {
		// Invalidate name field
		domain.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Domain
				agent.post('/domains')
					.send(domain)
					.expect(400)
					.end(function(domainSaveErr, domainSaveRes) {
						// Set message assertion
						(domainSaveRes.body.message).should.match('Please fill Domain name');
						
						// Handle Domain save error
						done(domainSaveErr);
					});
			});
	});

	it('should be able to update Domain instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Domain
				agent.post('/domains')
					.send(domain)
					.expect(200)
					.end(function(domainSaveErr, domainSaveRes) {
						// Handle Domain save error
						if (domainSaveErr) done(domainSaveErr);

						// Update Domain name
						domain.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Domain
						agent.put('/domains/' + domainSaveRes.body._id)
							.send(domain)
							.expect(200)
							.end(function(domainUpdateErr, domainUpdateRes) {
								// Handle Domain update error
								if (domainUpdateErr) done(domainUpdateErr);

								// Set assertions
								(domainUpdateRes.body._id).should.equal(domainSaveRes.body._id);
								(domainUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Domains if not signed in', function(done) {
		// Create new Domain model instance
		var domainObj = new Domain(domain);

		// Save the Domain
		domainObj.save(function() {
			// Request Domains
			request(app).get('/domains')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Domain if not signed in', function(done) {
		// Create new Domain model instance
		var domainObj = new Domain(domain);

		// Save the Domain
		domainObj.save(function() {
			request(app).get('/domains/' + domainObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', domain.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Domain instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Domain
				agent.post('/domains')
					.send(domain)
					.expect(200)
					.end(function(domainSaveErr, domainSaveRes) {
						// Handle Domain save error
						if (domainSaveErr) done(domainSaveErr);

						// Delete existing Domain
						agent.delete('/domains/' + domainSaveRes.body._id)
							.send(domain)
							.expect(200)
							.end(function(domainDeleteErr, domainDeleteRes) {
								// Handle Domain error error
								if (domainDeleteErr) done(domainDeleteErr);

								// Set assertions
								(domainDeleteRes.body._id).should.equal(domainSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Domain instance if not signed in', function(done) {
		// Set Domain user 
		domain.user = user;

		// Create new Domain model instance
		var domainObj = new Domain(domain);

		// Save the Domain
		domainObj.save(function() {
			// Try deleting Domain
			request(app).delete('/domains/' + domainObj._id)
			.expect(401)
			.end(function(domainDeleteErr, domainDeleteRes) {
				// Set message assertion
				(domainDeleteRes.body.message).should.match('User is not logged in');

				// Handle Domain error error
				done(domainDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Domain.remove().exec();
		done();
	});
});