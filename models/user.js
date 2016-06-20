'use strict';

let db = require('../lib/database');

module.exports = db.Model.extend({
	tableName: 'users',
	uuid: true,
	hasTimestamps: true,
	bcrypt: {
		field: 'password'
	},
	hidden: ['password']
});