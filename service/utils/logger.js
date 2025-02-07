const {createLogger, transports, format} = require('winston')
const {timestamp, printf, combine} = format
const dailyLogger = require('winston-daily-rotate-file')

const custDateFormat = printf(({level, message, timestamp}) => {
    return `${timestamp} [${level}] : ${message}`
})

const fileRotateTransport = new transports.DailyRotateFile({
    filename : "./log/logs-rotate %DATE%.log",
    datePattern : "YYYY-MM-DD"
})

const log = createLogger({
    format : combine(timestamp({format : "MM-DD-YYYY HH:mm:ss"}), custDateFormat),
    transports : [fileRotateTransport]
})

module.exports = log