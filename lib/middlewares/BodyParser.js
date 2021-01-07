'use strict';

/**
 * Body-Parser middleware for Helica
 */
class BodyParser {
    /**
     * Parse the body data of a request for JSON content
     * @param {HttpResponse} response A uWebSockets HttpResponse object
     * @static
     */
    static json(response) {
        return new Promise((resolve, reject) => {
            let buffer;

            response.onData((arrayBuffer, isLast) => {
                const chunk = Buffer.from(arrayBuffer);

                if (isLast) {
                    let json;

                    if (buffer) {
                        try {
                            json = JSON.parse(Buffer.concat([buffer, chunk]));
                        } catch {
                            return resolve({});
                        }

                        resolve(json);
                    } else {
                        try {
                            json = JSON.parse(chunk);
                        } catch {
                            return resolve({});
                        }

                        resolve(json);
                    }
                } else if (buffer) {
                    buffer = Buffer.concat([buffer, chunk]);
                } else {
                    buffer = Buffer.concat([chunk]);
                }
            });

            response.onAborted(reject);
        });
    }
}

/**
 * Helica body-parser middleware
 * @param {Object} [options] Options for configuring bodyParser
 * @param {String} [options.body] The request property name to which the parsed body data should be attached to. Defaults to "body".
 */
module.exports = (options = {}) => {
    return async (response, request) => {
        if (!request.__bodyIsParsed) {
            const parsedJSON = await BodyParser.json(response);
            request.__bodyIsParsed = true;

            if (options.body) {
                request[options.body] = parsedJSON;
            } else {
                request.body = parsedJSON;
            }
        }
    };
};
