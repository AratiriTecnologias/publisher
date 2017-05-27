'use strict';

const log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: '/app/log/production.log', category: 'production' }
    ]
});

const logger = log4js.getLogger('production');

export default logger;