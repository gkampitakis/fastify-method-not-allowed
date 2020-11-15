import { FastifyPlugin, RouteOptions, HTTPMethods } from 'fastify';

type Response = string | number | { [key: string]: Response };

type FourOhFourResponse = Response | ((request?: RouteOptions) => Response);
type FourOhFiveResponse = Response | ((request?: RouteOptions, methods?: HTTPMethods[]) => Response);

export interface MethodNotAllowedOptions {
  /** Prefix on which path this plugin will be enabled */
  prefix?: string;
  /** Custom responses to override default*/
  responses?: {
    404?: FourOhFourResponse;
    405?: FourOhFiveResponse;
  };
  /** For more information https://www.fastify.io/docs/v1.14.x/Server/#setnotfoundhandler */
  setNotFoundHandlerOptions?: any;
}

declare const methodNotAllowed: FastifyPlugin<MethodNotAllowedOptions>;
export default methodNotAllowed;
