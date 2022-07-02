import winston from 'winston'

export class Logger {
  readonly logger: winston.Logger
  readonly service: string

  constructor(service: string, logger: winston.Logger) {
    this.service = service
    this.logger = logger
  }

  debug(msg: string, e?: unknown): void {
    this.logger.debug(`[${this.service}]: ${msg}`, e)
  }
  info(msg: string, e?: unknown): void {
    this.logger.info(`[${this.service}]: ${msg}`, e)
  }
  warn(msg: string, e?: unknown): void {
    this.logger.warn(`[${this.service}]: ${msg}`, e)
  }
  error(msg: string, e?: unknown): void {
    this.logger.error(`[${this.service}]: ${msg}`, e)
  }
}
