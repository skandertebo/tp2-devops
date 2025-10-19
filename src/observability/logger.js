/**
 * Logger - Structured logging utility
 * Provides different log levels: debug, info, warn, error
 */

const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

class Logger {
  constructor(context = "App") {
    this.context = context;
  }

  formatMessage(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...metadata,
    };
  }

  debug(message, metadata) {
    const log = this.formatMessage(LOG_LEVELS.DEBUG, message, metadata);
    console.debug(JSON.stringify(log));
  }

  info(message, metadata) {
    const log = this.formatMessage(LOG_LEVELS.INFO, message, metadata);
    console.info(JSON.stringify(log));
  }

  warn(message, metadata) {
    const log = this.formatMessage(LOG_LEVELS.WARN, message, metadata);
    console.warn(JSON.stringify(log));
  }

  error(message, metadata) {
    const log = this.formatMessage(LOG_LEVELS.ERROR, message, metadata);
    console.error(JSON.stringify(log));
  }
}

export default Logger;
