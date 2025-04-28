const pinoHttp = require('pino-http')
const logger = require('../utils/logger')

const httpLogger = pinoHttp({logger})

module.exports = httpLogger