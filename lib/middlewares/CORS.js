'use strict';

/**
 * CORS class for the Helica CORS middleware
 */
class CORS {
    static initialize(response, request, options) {
        /**
         * @todo Implement CORS
         */
    }
}

module.exports = (options = {}) => {
    return (response, request) => {
        CORS.initialize(response, request, options);
    };
};
