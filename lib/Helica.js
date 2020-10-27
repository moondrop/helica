'use strict';

const uWS = require('uWebSockets.js');
const kleur = require('kleur');
const ora = require('ora');
const Logger = require('./helpers/Logger');
const HTTPVerbs = require('./constants/HTTPVerbs');
const EndResponse = require('./helpers/EndResponse');

/**
 * Main server class of Helica
 * @property {Object} [options] A configuration object for the Helica server instance
 * @property {Boolean} [options.sslApp] Whether or not Helica should be spawned as an SSL application
 * @property {Object} [options.uWSAppOptions] App options passed to uWebSockets.js for SSL applications
 * @property {Boolean} [options.debug] Whether or not to run Helica in debug mode
 */
class Helica {
    constructor(options = {}) {
        this.serverEnvironment = {};
        this.isSSLApp = options.sslApp;
        this.appOptions = options.uWSAppOptions;
        this.debugMode = options.debug;
        this.server = null;
        this.HTTPSocket = null;
        this.running = false;
        this.shuttingDown = false;
        this.globalMiddlewares = [];

        this._initialize();
    }

    /**
     * Initialize the Helica server
     * @private
     */
    _initialize() {
        if (this.isSSLApp) {
            if (!this.appOptions) {
                throw new Error('Helica was not instantiated with uWSAppOptions. An SSL server cannot be constructed without them.');
            }

            this.server = uWS.SSLApp(this.appOptions);
        } else {
            this.server = uWS.App();
        }
    }

    /**
     * Serialize a uWebSockets HttpRequest good for multiple uses
     * @param {HttpRequest} request An uWebSockets HttpRequest object
     * @returns {Object} A serialized HttpRequest object good for multiple uses
     */
    _serializeRequest(request, route) {
        const headers = [];

        request.forEach((headerName, headerValue) => {
            headers.push({ name: headerName, value: headerValue });
        });

        const HTTPMethod = request.getMethod().toUpperCase();

        const parameters = {};
        const parameterNames = route.split('/').filter((part) => part.startsWith(':'));

        for (let i = 0; i < parameterNames.length; i++) {
            parameters[parameterNames[i].slice(1)] = request.getParameter(i);
        }

        const query = request.getQuery();
        const url = request.getUrl();

        return { headers, method: HTTPMethod, parameters, query, url };
    }

    /**
     * Run the Helica server
     * @param {String} [host] A host on which Helica should run on. Defaults to '0.0.0.0'
     * @param {Number} [port] A port to which Helica should listen to. Defaults to 28785
     */
    run(host = '0.0.0.0', port = 28785) {
        if (this.HTTPSocket !== null) {
            return Logger.error('ERROR', 'An instance of Helica is already running on this process.');
        }

        process.on('SIGINT', () => {
            if (!this.shuttingDown) {
                process.stdout.write('\n');

                const spinner = ora('Trying to shut down gracefully').start();

                uWS.us_listen_socket_close(this.HTTPSocket);
                this.HTTPSocket = null;
                this.running = false;
                this.shuttingDown = true;

                setTimeout(() => {
                    spinner.succeed('Successfully shut down gracefully!');
                    process.exit(0);
                }, 2500);
            }
        });

        this.server.any('/*', (response, _request) => {
            EndResponse.send(response, '501 Not Implemented', 501);
        });

        this.server.listen(host, port, (token) => {
            this.HTTPSocket = token;
            this.running = true;
            this.serverEnvironment = { host, port };

            if (token) {
                Logger.success('INFO', `Successfully started! Listening on ${kleur.bold(`http${this.isSSLApp ? 's' : ''}://${host}:${port}`)} (Press CTRL+C to quit)`);

                if (this.debugMode) {
                    Logger.warning('WARNING', `Helica is currently running in debug mode! ${kleur.bold('DO NOT')} run debug mode in production, as it severely affects performance!`);
                }
            } else {
                Logger.error('STARTUP ERROR', 'Something went wrong trying to run Helica.');
            }
        });
    }

    /**
     * Add middleware to the global state of a Helica server instance.
     * Middleware functions are expected to return a Promise and are given the HTTPResponse and HTTPRequest objects.
     * Only middlewares PRIOR to added resources are respected. Middlewares added after a resource will not respect the registered middlewares.
     * @param {Promise<any>} middleware A function which needs to return a Promise
     */
    addMiddleware(middleware) {
        this.globalMiddlewares.push(middleware);
    }

    /**
     * Add a resource to Helica and register every route provided by the resource
     * @param {String} route Which route the resource should handle
     * @param {Class} resource The resource class for the route
     */
    addResource(route, resourceHandler) {
        const ResourceHandler = new resourceHandler();
        const availableResourceMethods = Object.getOwnPropertyNames(resourceHandler.prototype).filter((method) => method !== 'constructor');

        for (const requestMethod of availableResourceMethods) {
            if (HTTPVerbs.includes(requestMethod.toUpperCase())) {
                if (requestMethod.toUpperCase() === 'DELETE') {
                    this.server.del(route, async (response, request) => {
                        response.onAborted(() => {
                            response.aborted = true;
                        });

                        const serializedRequest = this._serializeRequest(request, route);

                        try {
                            for (const middleware of this.globalMiddlewares) {
                                await middleware(response, serializedRequest);
                            }
                        } catch (error) {
                            return EndResponse.send(response, error, 500);
                        }

                        if (this.debugMode) {
                            Logger.route(`${Buffer.from(response.getRemoteAddressAsText()).toString()}:${this.serverEnvironment.port} - ${kleur.bold().cyan('"' + serializedRequest.method)} ${kleur.bold().cyan(serializedRequest.url + ' HTTP/1.1"')}`);
                        }

                        ResourceHandler[requestMethod](response, serializedRequest);
                    });
                } else {
                    this.server[requestMethod.toLowerCase()](route, async (response, request) => {
                        response.onAborted(() => {
                            response.aborted = true;
                        });

                        const serializedRequest = this._serializeRequest(request, route);

                        try {
                            for (const middleware of this.globalMiddlewares) {
                                await middleware(response, serializedRequest);
                            }
                        } catch (error) {
                            return EndResponse.send(response, error, 500);
                        }

                        if (this.debugMode) {
                            Logger.route(`${Buffer.from(response.getRemoteAddressAsText()).toString()}:${this.serverEnvironment.port} - ${kleur.bold().cyan('"' + serializedRequest.method)} ${kleur.bold().cyan(serializedRequest.url + ' HTTP/1.1"')}`);
                        }

                        ResourceHandler[requestMethod](response, serializedRequest);
                    });
                }

                if (this.debugMode) {
                    Logger.debug('RESOURCE ATTACHED', `Successfully attached resource to route ${kleur.bold().cyan(requestMethod.toUpperCase())} ${kleur.bold().cyan(route)}`);
                }
            }
        }
    }
}

module.exports = Helica;
