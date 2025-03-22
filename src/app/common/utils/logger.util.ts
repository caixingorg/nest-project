import { LoggerService } from '@nestjs/common';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';

export class AppLogger implements LoggerService {
  private context?: string;
  private logger: WinstonLogger;

  constructor(context?: string) {
    this.context = context;
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      defaultMeta: { service: 'nest-enterprise' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, context, ...meta }) => {
              const contextStr = (context ||
                this.context ||
                'Application') as string;
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta)
                : '';
              return `${timestamp} [${level}] [${contextStr}] ${message} ${metaStr}`;
            }),
          ),
        }),
        // Add file transport for production
        ...(process.env.NODE_ENV === 'production'
          ? [
              new transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new transports.File({ filename: 'logs/combined.log' }),
            ]
          : []),
      ],
    });
  }

  log(message: any, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  setContext(context: string): void {
    this.context = context;
  }
}
