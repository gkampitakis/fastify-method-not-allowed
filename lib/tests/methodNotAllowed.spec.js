'use strict';

const Fastify = require('fastify');
const t = require('tap');
const test = t.test;
const methodNotAllowed = require('../');

const handler = (_, __) => { };

function setupRoutes (fastify) {
  fastify.register((instance, _, done) => {
    instance.get('/', handler);
    instance.route({ url: '/', method: ['PATCH', 'OPTIONS'], handler });
    done();
  }, { prefix: '/mock' });// GET, PATCH, OPTIONS

  fastify.register((instance, _, done) => {
    instance.get('/', handler);// GET
    done();
  }, { prefix: '/test' });

  fastify.get('/', handler); // GET
}

test('default options', t => {
  const fastify = Fastify();

  fastify.register(methodNotAllowed);
  setupRoutes(fastify);

  test('it should return 405', t => {
    t.plan(6);

    fastify.inject({ url: '/', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, 405);
      t.equal(res.headers.allow, 'HEAD');
      t.equal(body.message, 'Route POST:/ not allowed');
      t.equal(body.error, 'Method Not Allowed');
    });
  });

  test('it should return 404', t => {
    t.plan(5);

    fastify.inject({ url: '/not-found', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 404);
      t.equal(body.statusCode, 404);
      t.equal(body.message, 'Route POST:/not-found not found');
      t.equal(body.error, 'Not Found');
    });
  });

  t.end();
});

test('handle only prefixed routes', t => {
  const fastify = Fastify();

  fastify.register(methodNotAllowed, { prefix: '/mock' });
  fastify.register(methodNotAllowed, { prefix: '/test' });
  setupRoutes(fastify);

  test('non-prefixed route should return 404', t => {
    t.plan(5);

    fastify.inject({ url: '/', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 404);
      t.equal(body.statusCode, 404);
      t.equal(body.message, 'Route POST:/ not found');
      t.equal(body.error, 'Not Found');
    });
  });

  test('prefixed route should return 405', t => {
    t.plan(6);

    fastify.inject({ url: '/mock', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, 405);
      t.equal(res.headers.allow, 'GET, PATCH, OPTIONS, HEAD');
      t.equal(body.message, 'Route POST:/mock not allowed');
      t.equal(body.error, 'Method Not Allowed');
    });
  });

  test('prefixed route should return 405', t => {
    t.plan(6);

    fastify.inject({ url: '/test', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, 405);
      t.equal(res.headers.allow, 'GET, HEAD');
      t.equal(body.message, 'Route POST:/test not allowed');
      t.equal(body.error, 'Method Not Allowed');
    });
  });

  t.end();
});

test('pass different response message', t => {
  const fastify = Fastify();

  fastify.register(methodNotAllowed, {
    prefix: '/mock',
    responses: {
      405: (request, allowedMethods) => ({
        message: `Custom message on ${request.method}:${request.url}`,
        allowed: allowedMethods
      }),
      404: 'Route not found'
    }
  });
  fastify.register(methodNotAllowed, { prefix: '/test' });
  setupRoutes(fastify);

  test('non-prefixed route should return 404', t => {
    t.plan(5);

    fastify.inject({ url: '/', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 404);
      t.equal(body.statusCode, 404);
      t.equal(body.message, 'Route POST:/ not found');
      t.equal(body.error, 'Not Found');
    });
  });

  test('prefixed route should return custom 405 response', t => {
    t.plan(7);

    fastify.inject({ url: '/mock', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, undefined);
      t.equal(body.message, 'Custom message on POST:/mock');
      t.same(body.allowed, ['GET', 'PATCH', 'OPTIONS', 'HEAD']);
      t.equal(res.headers.allow, 'GET, PATCH, OPTIONS, HEAD');
      t.equal(body.error, undefined);
    });
  });

  test('prefixed route should return custom 404 response', t => {
    t.plan(3);

    fastify.inject({ url: '/mock/not-found', method: 'POST' }, (err, res) => {
      t.equal(err, null);
      t.equal(res.statusCode, 404);
      t.equal(res.body, 'Route not found');
    });
  });

  test('prefixed route should return default 405', t => {
    t.plan(6);

    fastify.inject({ url: '/test', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, 405);
      t.equal(body.message, 'Route POST:/test not allowed');
      t.equal(res.headers.allow, 'GET, HEAD');
      t.equal(body.error, 'Method Not Allowed');
    });
  });

  test('prefixed route should return default 404', t => {
    t.plan(5);

    fastify.inject({ url: '/test', method: 'POST' }, (err, res) => {
      const body = JSON.parse(res.body);

      t.equal(err, null);
      t.equal(res.statusCode, 405);
      t.equal(body.statusCode, 405);
      t.equal(body.message, 'Route POST:/test not allowed');
      t.equal(body.error, 'Method Not Allowed');
    });
  });

  t.end();
});

test('pass setNotFoundHandler options', t => {
  const fastify = Fastify();

  fastify.register(methodNotAllowed, {
    setNotFoundHandlerOptions: {
      preHandler: (req, reply, done) => {
        reply.send('message');
        done();
      }
    }
  });
  setupRoutes(fastify);

  test('setNotFoundHandlerOptions should by applied', t => {
    t.plan(3);

    fastify.inject({ url: '/', method: 'POST' }, (err, res) => {
      t.equal(err, null);
      t.equal(res.statusCode, 200);
      t.equal(res.body, 'message');
    });
  });

  t.end();
});
