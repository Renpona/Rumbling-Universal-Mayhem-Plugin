import winston, { Logger, format } from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';
import { resolveResource } from "./utils";

var logger: Logger;
var intifaceLogger: Logger;

var formatConfig = format.combine(
    //format.timestamp(),
    format.colorize({ level: true }),
    format.errors({ stack: true }),
    format.align(),
    format.padLevels(),
    format.splat(),
    format.simple()
);

function initLogger() {
    let level = 'debug';
    logger = winston.createLogger({
        level: level,
        format: formatConfig,
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                level: 'debug',
            }),
            new DailyRotateFile({ 
                filename: resolveResource('./logs/rump-%DATE%.log'),
                handleExceptions: true,
                level: 'info',
                datePattern: 'YYYY-MM-DD',
                maxSize: "10m",
                maxFiles: 3
            })
        ],
    });
    initIntifaceLogger();
    return logger;
}

function debugLogger() {
    logger.info("Adding debug logger...");
    let debugTransport = new DailyRotateFile({ 
        filename: resolveResource('./logs/debug-%DATE%.log'),
        handleExceptions: true,
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        maxSize: "10m",
        maxFiles: 3
    });
    getLogger().add(debugTransport);
}

function initIntifaceLogger() {
    console.log("Init intiface logger");
    let formatConfig = format.printf((info) => {
        return info.message.toWellFormed();
    });
    intifaceLogger = winston.createLogger({
        level: 'verbose',
        format: formatConfig,
        transports: [
            new winston.transports.Console({
                handleExceptions: true
            }),
            new DailyRotateFile({ 
                filename: resolveResource('./logs/intiface-%DATE%.log'),
                handleExceptions: true,
                format: format.combine(
                    formatConfig,
                    format.uncolorize()
                ),
                datePattern: 'YYYY-MM-DD',
                maxSize: "10m",
                maxFiles: 3
            })
        ],
    });
}

function getLogger() {
    if (logger) {
        return logger;
    } else {
        console.warn("Logger being called before basic logger init!");
        return initLogger();
    }
}

function getIntifaceLogger() {
    return intifaceLogger;
}

export { initLogger, debugLogger, getLogger, getIntifaceLogger }