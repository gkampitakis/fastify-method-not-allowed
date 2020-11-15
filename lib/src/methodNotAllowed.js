'use strict';

const { PathnameStore } = require('@lunjs/pathname-store');
const defaultResponses = {
  404: ({ method, url }) => ({
    message: `Route ${method}:${url} not found`,
    error: 'Not Found',
    statusCode: 404
  }),
  405: ({ method, url }) => ({
    message: `Route ${method}:${url} not allowed`,
    error: 'Method Not Allowed',
    statusCode: 405
  })
};

function registerRoutes (fastify, routeRegistry, options) {
  fastify.addHook('onRoute', (routeOptions) => {
    const { url, prefix, method } = routeOptions;

    if (options.prefix && options.prefix !== prefix) return;

    const _methods = Array.isArray(method) ? method : [method];
    const item = routeRegistry.find(url);

    if (item.found) {
      routeRegistry.add(url, item.box.store.concat(_methods));
      return;
    }

    routeRegistry.add(url, _methods);
  });
}

function returnCallable (unknownObj) {
  if (typeof (unknownObj) === 'function') return unknownObj;
  else return () => unknownObj;
}

function methodNotAllowed (fastify, options, next) {
  const routeRegistry = new PathnameStore();
  registerRoutes(fastify, routeRegistry, options);

  const { setNotFoundHandlerOptions, prefix, responses = {} } = options;
  const computedResponses = {
    404: responses[404] ? returnCallable(responses[404]) : defaultResponses[404],
    405: responses[405] ? returnCallable(responses[405]) : defaultResponses[405]
  };

  fastify.register(function (instance, _, done) {
    instance.setNotFoundHandler(setNotFoundHandlerOptions, (req, res) => {
      const value = routeRegistry.find(req.url.split('?')[0]);
      if (value.found) {
        return res
          .status(405)
          .header('Allow', value.box.store.join(', '))
          .send(computedResponses[405](req, value.box.store));
      }

      return res.status(404).send(computedResponses[404](req));
    });

    done();
  }, { prefix });

  next();
}

module.exports = {
  methodNotAllowed
};
