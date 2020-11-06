'use strict';

const uWS = require('uWebSockets.js');
const kleur = require('kleur');
const ora = require('ora');
const path = require('path');
const fs = require('fs').promises;
const Logger = require('./helpers/Logger');
const HTTPVerbs = require('./constants/HTTPVerbs');
const EndResponse = require('./helpers/EndResponse');
const MimeTypes = require('./constants/MimeTypes');

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
        this.usedBasePaths = [];
        this.staticRoutes = new Map();

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
     * @param {String} route The route which the request should be serialized for
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
     * Read files from an entry point recursively
     * @async
     * @private
     * @param {String} directory A directory path to read files from
     * @returns {Promise<Array<String>>} A promise resolving with all files
     */
    async _walkDirectory(directory) {
        const dirents = await fs.readdir(directory, { withFileTypes: true });
        const files = await Promise.all(dirents.map((dirent) => {
            const result = path.resolve(directory, dirent.name);
            return (dirent.isDirectory()) ? this._walkDirectory(result) : result;
        }));

        return Array.prototype.concat(...files);
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
            EndResponse.send(response, '404 Not Found', 404);
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
     * Attaches a static file handler to Helica for serving static assets
     * IMPORTANT: serveStatic MUST be called before Helica is run!
     * @async
     * @param {String} directory A directory to serve static assets from
     * @param {String} [basePath] A base path where the static assets should be mapped to
     * @returns {Promise<void>} An empty promise that fulfills upon successfully setting up static serving
     */
    async serveStatic(directory, basePath = '/') {
        if (this.running) {
            return Logger.error('SERVE STATIC AFTER RUNNING', 'An instance of Helica is already running. Please set up serveStatic before running Helica.');
        }

        if (this.usedBasePaths.includes(basePath)) {
            return Logger.error('DUPLICATE BASE PATH', `Helica is already serving content under the base path "${basePath}"!`);
        }

        if (!this.staticRoutes.get(directory)) {
            this.staticRoutes.set(directory, []);
        }

        const files = await this._walkDirectory(directory);

        for (const file of files) {
            const route = file.replace(directory, '');
            const suffix = route.split('.');
            const mimeType = MimeTypes[suffix[suffix.length - 1].toUpperCase()];
            let content = '';

            switch (mimeType) {
                case 'image/png':
                case 'image/jpeg':
                case 'image/x-icon':
                case 'image/gif':
                case 'image/tiff':
                case 'image/bmp':
                case 'image/svg+xml':
                    content = await fs.readFile(file);
                    break;

                default:
                    content = await fs.readFile(file, 'utf-8');
                    break;
            }

            this.staticRoutes.get(directory).push({ route, mimeType, content });
        }

        if (this.staticRoutes.get(directory).length > 0) {
            for (const staticRoute of this.staticRoutes.get(directory)) {
                if (['/index.html', '/index.htm'].includes(staticRoute.route)) {
                    this.server.get(path.join('/', basePath), (response) => {
                        EndResponse.render(response, staticRoute.content, 200, {
                            'Content-Type': `${staticRoute.mimeType}; charset=utf-8`
                        });
                    });
                }

                this.server.get(path.join('/', basePath, staticRoute.route), (response) => {
                    response.writeHeader('Cache-Control', 'max-age=3600');
                    EndResponse.send(response, staticRoute.content, 200, {
                        'Content-Type': `${staticRoute.mimeType}; charset=utf-8`
                    });
                });
            }

            this.usedBasePaths.push(basePath);
        }
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
