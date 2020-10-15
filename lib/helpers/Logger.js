'use strict';

const kleur = require('kleur');

/**
 * Colorful logger class. This logger class is used primarily internally
 */
class Logger {
    /**
     * Pads a single number for unified looks in the console
     * @param {Number} number The number that should be force-padded
     * @returns {Number} The padded number
     */
    static _forcePadding(number) {
        return (number < 10 ? '0' : '') + number;
    }

    /**
     * Gets the full current system time and date for logging purposes
     * @returns {String} The formatted current time
     */
    static _getCurrentTime() {
        const now = new Date();
        const day = this._forcePadding(now.getDate());
        const month = this._forcePadding(now.getMonth() + 1);
        const year = this._forcePadding(now.getFullYear());
        const hour = this._forcePadding(now.getHours());
        const minute = this._forcePadding(now.getMinutes());
        const second = this._forcePadding(now.getSeconds());

        return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
    }

    /**
     * Log something related to being successful
     * @param {String} title The title of the log enty
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static success(title, body) {
        console.log(kleur.bold().green(`[ ${this._getCurrentTime()} ] [ ${title} ] `) + body);
    }

    /**
     * Log something related to a warning
     * @param {String} title The title of the log enty
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static warning(title, body) {
        console.log(kleur.bold().yellow(`[ ${this._getCurrentTime()} ] [ ${title} ] `) + body);
    }

    /**
     * Log something related to an error
     * @param {String} title The title of the log enty
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static error(title, body) {
        console.log(kleur.bold().red(`[ ${this._getCurrentTime()} ] [ ${title} ] `) + body);
    }

    /**
     * Log something related to debugging
     * @param {String} title The title of the log enty
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static debug(title, body) {
        console.log(kleur.bold().magenta(`[ ${this._getCurrentTime()} ] [ ${title} ] `) + body);
    }

    /**
     * Log something related to an event
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static event(body) {
        console.log(kleur.bold().yellow(`[ ${this._getCurrentTime()} ] [ EVENT ] `) + body);
    }

    /**
     * Log something related to a route
     * @param {String} body The body of the log entry
     * @returns {Void}
     */
    static route(body) {
        console.log(kleur.bold().blue(`[ ${this._getCurrentTime()} ] [ ROUTE ] `) + body);
    }
}

module.exports = Logger;
