const logger = require('winston');

module.exports = function configureLogger(options) {
  logger.add(new logger.transports.Console({
    level: options.level,
    format: logger.format.simple(),
  }));
};
