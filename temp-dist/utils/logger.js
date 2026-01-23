"use strict";
// Logging utility for consistent logging across the application
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor() {
        this.logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    formatMessage(level, message, options = {}) {
        const { context, error, metadata } = options;
        const timestamp = new Date().toISOString();
        let formatted = `${timestamp} [${level.toUpperCase()}]`;
        if (context) {
            formatted += ` [${context}]`;
        }
        formatted += ` ${message}`;
        if (error) {
            formatted += ` - Error: ${error.message}`;
            if (error.stack) {
                formatted += `\n${error.stack}`;
            }
        }
        if (metadata) {
            formatted += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
        }
        return formatted;
    }
    debug(message, options = {}) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, options));
        }
    }
    info(message, options = {}) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, options));
        }
    }
    warn(message, options = {}) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, options));
        }
    }
    error(message, options = {}) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, options));
        }
    }
}
exports.default = new Logger();
