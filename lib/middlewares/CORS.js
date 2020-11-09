'use strict';

const Logger = require('../helpers/Logger');
const HTTPStatusCodes = require('../constants/HTTPStatusCodes');

/**
 * CORS class for the Helica CORS middleware
 * @param {Object} [options] Options for configuring CORS
 * @param {String|Array<String>} [options.origin] `Access-Control-Allow-Origin` Which origin CORS should be enabled for. This can be a single string or an array of strings for multiple origins. If "*" is passed, every origin is allowed. Defaults to the origin requesting the resource.
 * @param {String|Array<String>} [options.methods] `Access-Control-Allow-Methods` All HTTP methods allowed delimited by a comma or an array of methods. Defaults to 'GET,HEAD,PUT,POST,DELETE,PATCH'
 * @param {String|Array<String>} [options.exposedHeaders] `Access-Control-Expose-Headers` All headers that should be exposed to the client in addition to the default set specified by the CORS specification. Defaults to '' (none)
 * @param {String|Array<String>} [options.allowedHeaders] `Access-Control-Allow-Headers` All headers that should be allowed by the client in addition to the default set specified by the CORS specification. Defaults to '' (none)
 * @param {String|Number} [options.maxAge] `Access-Control-Max-Age` Amount in seconds for how long a preflight request should be cached for. Defaults to no header being set
 * @param {Boolean} [options.credentials] `Access-Control-Allow-Credentials` Whether or not credentials should be allowed. Defaults to no header being set
 */
class CORS {
    constructor(options = {}) {
        this.origin = options.origin || '*';
        this.methods = options.methods || 'GET, HEAD, PUT, POST, DELETE, PATCH';
        this.exposedHeaders = options.exposedHeaders || '';
        this.allowedHeaders = options.allowedHeaders || '';
        this.maxAge = options.maxAge || null;
        this.credentials = options.credentials || null;
    }

    run(response, request) {
        response.writeHeader('Vary', 'Origin');

        const requestHeader = request.headers.find((header) => header.name.toLowerCase() === 'origin');

        if (!requestHeader) {
            return;
        }

        const requestOrigin = requestHeader.value;

        if (!requestOrigin) {
            return;
        }

        let origin;

        if (Array.isArray(this.origin)) {
            if (this.origin.includes(requestOrigin)) {
                origin = requestOrigin;
            } else {
                return;
            }
        } else if (typeof this.origin === 'string') {
            if (this.origin.toLowerCase() === '*') {
                origin = requestOrigin;
            } else if (this.origin.toLowerCase() === requestOrigin.toLowerCase()) {
                origin = this.origin;
            } else {
                return;
            }
        } else {
            return Logger.error('CORS INVALID ORIGIN', 'Only origins of type "String" and "Array<String>" are allowed.');
        }

        if (Array.isArray(this.methods)) {
            this.methods = this.methods.join(', ');
        } else if (typeof this.methods !== 'string') {
            return Logger.error('CORS INVALID METHODS', 'Only methods of type "String" and "Array<String>" are allowed.');
        }

        if (Array.isArray(this.exposedHeaders)) {
            this.exposedHeaders.join(', ');
        } else if (typeof this.exposedHeaders !== 'string') {
            return Logger.error('CORS INVALID EXPOSED HEADERS', 'Only exposed headers of type "String" and "Array<String>" are allowed.');
        }

        if (Array.isArray(this.allowedHeaders)) {
            this.allowedHeaders.join(', ');
        } else if (typeof this.allowedHeaders !== 'string') {
            return Logger.error('CORS INVALID ALLOWED HEADERS', 'Only allowed headers of type "String" and "Array<String>" are allowed.');
        }

        if (this.maxAge) {
            this.maxAge = String(this.maxAge);
        }

        if (request.method === 'OPTIONS') {
            if (!request.headers.find((header) => header.name.toLowerCase() === 'access-control-request-method')) {
                return;
            }

            response.writeHeader('Access-Control-Allow-Origin', origin);

            if (this.credentials && this.credentials === true) {
                response.writeHeader('Access-Control-Allow-Credentials', 'true');
            }

            if (this.maxAge) {
                response.writeHeader('Access-Control-Max-Age', this.maxAge);
            }

            if (this.methods) {
                response.writeHeader('Access-Control-Allow-Methods', this.methods);
            }

            let preflightAllowedHeaders = this.allowedHeaders;

            if (!preflightAllowedHeaders) {
                const accessControlRequestHeaders = request.headers.find((header) => header.name.toLowerCase() === 'access-control-request-headers');

                if (accessControlRequestHeaders) {
                    preflightAllowedHeaders = accessControlRequestHeaders.value;
                }
            }

            if (preflightAllowedHeaders) {
                response.writeHeader('Access-Control-Allow-Headers', preflightAllowedHeaders);
            }
        } else {
            response.writeHeader('Access-Control-Allow-Origin', origin);

            if (this.credentials && this.credentials === true) {
                response.writeHeader('Access-Control-Allow-Credentials', 'true');
            }

            if (this.exposedHeaders) {
                response.writeHeader('Access-Control-Expose-Headers', this.exposedHeaders);
            }
        }

        response.writeStatus(HTTPStatusCodes[204]);
    }
}

/**
 * Exported CORS middleware
 * @param {Object} [options] Options for configuring CORS
 * @param {String|Array<String>} [options.origin] `Access-Control-Allow-Origin` Which origin CORS should be enabled for. This can be a single string or an array of strings for multiple origins. If "*" is passed, every origin is allowed. Defaults to the origin requesting the resource.
 * @param {String|Array<String>} [options.methods] `Access-Control-Allow-Methods` All HTTP methods allowed delimited by a comma or an array of methods. Defaults to 'GET,HEAD,PUT,POST,DELETE,PATCH'
 * @param {String|Array<String>} [options.exposedHeaders] `Access-Control-Expose-Headers` All headers that should be exposed to the client in addition to the default set specified by the CORS specification. Defaults to '' (none)
 * @param {String|Array<String>} [options.allowedHeaders] `Access-Control-Allow-Headers` All headers that should be allowed by the client in addition to the default set specified by the CORS specification. Defaults to '' (none)
 * @param {String|Number} [options.maxAge] `Access-Control-Max-Age` Amount in seconds for how long a preflight request should be cached for. Defaults to no header being set
 * @param {Boolean} [options.credentials] `Access-Control-Allow-Credentials` Whether or not credentials should be allowed. Defaults to no header being set
 */
module.exports = (options = {}) => {
    const cors = new CORS(options);

    return {
        name: '__cors',
        executor: (response, request) => {
            cors.run(response, request);
        }
    };
};
