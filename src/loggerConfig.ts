import winston, { Logger, format } from "winston";
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
            new winston.transports.File({ 
                filename: resolveResource('./logs/rump.log'),
                handleExceptions: true,
                level: 'info',
            })
        ],
    });
    initIntifaceLogger();
    return logger;
}

function debugLogger() {
    logger.info("Adding debug logger...");
    let debugTransport = new winston.transports.File({ 
        filename: resolveResource('./logs/debug.log'),
        handleExceptions: true,
        level: 'debug',
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
            new winston.transports.File({ 
                filename: resolveResource('./logs/intiface.log'),
                handleExceptions: true,
                format: format.combine(
                    formatConfig,
                    format.uncolorize()
                ),
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