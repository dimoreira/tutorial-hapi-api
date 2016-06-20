'use strict';

let Joi = require('joi');
let Hapi = require('hapi');
let User = require('./models/user');
let jwt = require('jsonwebtoken');
let Boom = require('boom');

const JWT_KEY = 'here be dragons';
let server = new Hapi.Server({
	debug: {
		request: ['error']
	}
});
server.connection({ port: 8080 });

server.register(require('hapi-auth-jwt2'), (err) => {
	if (err) throw err;

	function validate(jwt, req, cb) {
		User.forge({ id: jwt.id })
		.fetch()
		.then((user) => {
			if (user) {
				cb(null, true, user.toJSON());
			} else {
				cb(null, false);
			}
		})
		.catch((err) => cb(err));
	}

	server.auth.strategy('jwt', 'jwt', {
		key: JWT_KEY,
		validateFunc: validate
	})
});

server.route({
	method: 'POST',
	path: '/v1/users',
	handler: (req, res) => {
		console.log(req.payload);
		User.forge(req.payload)
		.save()
		.then((user) => res(user), (err) => res(err))
	},
	config: {
		validate: {
			payload: Joi.object({
				email: Joi.string().email().required(),
				password: Joi.string().required()
			})
		}
	}
});

server.route({
	method: 'POST',
	path: '/v1/sessions',
	handler: (req, res) => {
		let user;
		User.forge({ email: req.payload.email })
		.fetch({ required: true })
		.then((result) => {
			user = result;
			return result.compare(req.payload.password)
		})
		.then((isValid) => {
			if (isValid) {
				res({
					token: jwt.sign({ id: user.id }, JWT_KEY)
				})
			} else {
				res(Boom.unauthorized());
			}
		})
	},
	config: {
		validate: {
			payload: Joi.object({
				email: Joi.string().email().required(),
				password: Joi.string().required()
			})
		}
	}
});

server.route({
	method: 'GET',
	path: '/v1/sessions',
	handler: (req, res) => {
		res(req.auth.credentials);
	},
	config: {
		auth: 'jwt'
	}
});

server.start((err) => {
	if (err) {
		throw err;
	}

	console.log("Server running at:", server.info.uri);
});