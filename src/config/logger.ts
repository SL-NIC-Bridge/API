// import winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';
// import path from 'path';

// const logDir = process.env['LOG_FILE_PATH'] || 'logs';
// const logLevel = process.env['LOG_LEVEL'] || 'info';

// // Define log format
// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.errors({ stack: true }),
//   winston.format.json()
// );

// // Console format for development
// const consoleFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp({ format: 'HH:mm:ss' }),
//   winston.format.printf(({ timestamp, level, message, stack }) => {
//     if (stack) {
//       return `${timestamp} ${level}: ${message}\n${stack}`;
//     }
//     return `${timestamp} ${level}: ${message}`;
//   })
// );

// // Create logger instance
// const logger = winston.createLogger({
//   level: logLevel,
//   format: logFormat,
//   defaultMeta: { service: 'sl-nic-bridge-api' },
//   transports: [
//     // Error logs
//     new DailyRotateFile({
//       filename: path.join(logDir, 'error-%DATE%.log'),
//       datePattern: 'YYYY-MM-DD',
//       level: 'error',
//       maxSize: '20m',
//       maxFiles: '14d',
//     }),
//     // Combined logs
//     new DailyRotateFile({
//       filename: path.join(logDir, 'combined-%DATE%.log'),
//       datePattern: 'YYYY-MM-DD',
//       maxSize: '20m',
//       maxFiles: '14d',
//     }),
//   ],
// });

// // Add console transport for development
// if (process.env['NODE_ENV'] !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: consoleFormat,
//   }));
// }

// export default logger; 


import winston from 'winston';
import { config } from './environment';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: `${config.logging.filePath}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `${config.logging.filePath}/combined.log`,
    }),
  ],
});