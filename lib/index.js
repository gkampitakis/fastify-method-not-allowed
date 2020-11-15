'use strict';

const fp = require('fastify-plugin');
const { methodNotAllowed } = require('./src/methodNotAllowed');

module.exports = fp(methodNotAllowed, {
  name: 'fastify-method-not-allowed'
});
