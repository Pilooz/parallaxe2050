// /*
// logger.log('silly', "127.0.0.1 - there's no place like home");
// logger.log('debug', "127.0.0.1 - there's no place like home");
// logger.log('verbose', "127.0.0.1 - there's no place like home");
// logger.log('info', "127.0.0.1 - there's no place like home");
// logger.log('warn', "127.0.0.1 - there's no place like home");
// logger.log('error', "127.0.0.1 - there's no place like home");
// logger.info("127.0.0.1 - there's no place like home");
// logger.warn("127.0.0.1 - there's no place like home");
// logger.error("127.0.0.1 - there's no place like home");
// */
const appRoot = require('app-root-path');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = (scenarioId) => createLogger({
  format: combine(
    label({ label: scenarioId }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: `${appRoot}/logs/access.log` }), 
    new transports.File({ filename: `${appRoot}/logs/error.log`, level: 'error' })
  ]
});

module.exports = logger;