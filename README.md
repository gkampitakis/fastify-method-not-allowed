# Fastify Method Not Allowed

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)

`fastify-method-not-allowed` is a plugin for returning **405** status code for routes instead of default **404**.

Note you have to register this plugin before registering any routes, as it uses [onRoute](https://www.fastify.io/docs/v3.7.x/Hooks/#onroute) hook, so needs to "collect" them.

## Install

```bash
npm install fastify-method-not-allowed
```

## Usage

Require the module and just register it as any other fastify plugin.

```javascript
const methodNotAllowed = require('fastify-method-not-allowed');

server.register(methodNotAllowed);

server.get('/', (req, res) => res.send('Hello World'));

fastify.listen(3000);

/*
curl -X POST localhost:3000

This will return statusCode 405 instead of the 404 default response
*/
```

## API

### register plugin

```javascript
const methodNotAllowed = require('fastify-method-not-allowed');

server.register(methodNotAllowed, {
    responses: {
        404: 'Not Found',
        405: 'Method Not Allowed',
    },
});
```

### register options

-   `prefix`: prefix on which path this plugin will be enabled
    <br> <span style="font-size:15px"> You can register the plugin multiple times with different prefixes if you want to apply different responses on different paths<span>
-   `responses`
    <br> <span style="font-size:15px"> Default values<span>

    -   404

    ```json
    {
        "message": "Route <method>:<url> not found",
        "error": "Not Found",
        "statusCode": 404
    }
    ```

    -   405

    ```json
    {
        "message": "Route <method>:<url> not allowed",
        "error": "Method Not Allowed",
        "statusCode": 405
    }
    ```

    You can override those values by providing either a **value** or a **function**.

    -   For **404** you have access to the `request` object so you can pass a function e.g. `(req)=>"Route `\${req.url}` not found"`.
    -   For **405** you have access to the `request` and `allowedMethods` so you can pass a function e.g. `(req,methods)=>"Route `\${req.url}` allowed only ${methods}"`.

-   `setNotFoundHandlerOptions` You can pass options to fastify handler. [For more information](https://www.fastify.io/docs/latest/Server/#setnotfoundhandler).

## Typescript

In order to use this plugin you need to enable the flag `"esModuleInterop": true` in `tsconfig.json`.

then you can import it

```typescript
import methodNotAllowed from 'fastify-method-not-allowed';
```

### Note:

This plugin uses the `setNotFoundHandler` handler so you won't be able to re-use this handler in your own service at least with the same `prefix`.

### Issues

For any [issues](https://github.com/gkampitakis/fastify-method-not-allowed/issues).

## License

MIT License
