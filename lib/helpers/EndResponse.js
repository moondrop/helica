'use strict';

const StatusCodes = require('../constants/HTTPStatusCodes');

/**
 * Helper class for easily ending responses and handling built up backpressure from asynchronous tasks.
 */
class EndResponse {
    /**
     * Renders the passed content as HTML and ends the response
     * @param {HttpResponse} response An HTTP response
     * @param {String} html The HTML which the HTTP response should be ended with
     * @param {Number} [status = 200] A status code for ending the response. Defaults to '200 OK'
     * @param {Object} [headers = {}] Additional headers for ending the response. Common headers like Content-Type, Content-Length, Date and TTL are sent by default!
     * @param {Boolean} [disableBranding = false] Whether or not Helica should send the "Server" and "X-Powered-By" headers. Defaults to false
     */
    render(response, html, status = 200, headers = {}, disableBranding = false) {
        response.writeStatus(StatusCodes[status]);
        response.writeHeader('Date', new Date().toUTCString());
        response.writeHeader('Cache-Control', 'max-age=3600');
        response.writeHeader('Content-Type', 'text/html; charset=utf-8');

        for (const header in headers) {
            if (Object.prototype.hasOwnProperty.call(headers, header)) {
                response.writeHeader(header.toString(), headers[header].toString());
            }
        }

        if (!disableBranding) {
            response.writeHeader('Server', 'uWebSockets');
            response.writeHeader('X-Powered-By', 'Helica');
        }

        if (!response.aborted) {
            response.end(html);
        }
    }

    /**
     * Ends the response with optimized defaults
     * @param {HttpResponse} response An HTTP response
     * @param {Object|String} [content = ''] The content which the HTTP response should be ended with. Defaults to an empty response
     * @param {Number} [status = 200] A status code for ending the response. Defaults to '200 OK'
     * @param {Object} [headers = {}] Additional headers for ending the response. Common headers like Content-Type, Content-Length, Date and TTL are sent by default!
     * @param {Boolean} [disableBranding = false] Whether or not Helica should send the "Server" and "X-Powered-By" headers. Defaults to false
     */
    send(response, content = '', status = 200, headers = {}, disableBranding = false) {
        response.writeStatus(StatusCodes[status]);
        response.writeHeader('Date', new Date().toUTCString());
        response.writeHeader('Cache-Control', 'max-age=0');

        if (typeof content === 'object') {
            response.writeHeader('Content-Type', 'application/json; charset=utf-8');
            content = JSON.stringify(content);
        } else {
            response.writeHeader('Content-Type', 'text/plain; charset=utf-8');
        }

        for (const header in headers) {
            if (Object.prototype.hasOwnProperty.call(headers, header)) {
                response.writeHeader(header.toString(), headers[header].toString());
            }
        }

        if (!disableBranding) {
            response.writeHeader('Server', 'uWebSockets');
            response.writeHeader('X-Powered-By', 'Helica');
        }

        if (!response.aborted) {
            response.end(content);
        }
    }
}

module.exports = new EndResponse();
