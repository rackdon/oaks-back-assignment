import { cleanEnv, str } from 'envalid'
import winston, { format, transports } from 'winston'
import { SentryConfig } from './sentryConfig'
import Sentry from 'winston-sentry-log'

const { printf } = format

interface LogConfig {
  LOG_LEVEL: string
}

let envLevelConfig: LogConfig

function getEnvLogConfig(): LogConfig {
  envLevelConfig =
    envLevelConfig ||
    cleanEnv(process.env, {
      LOG_LEVEL: str({
        default: 'warn',
        choices: ['debug', 'info', 'warn', 'error'],
      }),
    })
  return envLevelConfig
}

export class LoggerConfig {
  readonly logLevel
  readonly sentryConfig: SentryConfig

  constructor(
    config?: LogConfig | null,
    sentryConfig: SentryConfig = new SentryConfig()
  ) {
    const finalConfig = config || getEnvLogConfig()
    this.logLevel = finalConfig.LOG_LEVEL
    this.sentryConfig = sentryConfig
  }

  create(service: string, format?: winston.Logform.Format): winston.Logger {
    const defaultFormat = printf(({ level, message }) => {
      return `${level} [${service}]: ${message}`
    })
    const logger = winston.createLogger({
      level: this.logLevel,
      format: format || defaultFormat,
      defaultMeta: { service: service },
      transports: [new transports.Console()],
      exceptionHandlers: [new transports.Console()],
    })
    if (this.sentryConfig.dsn) {
      const options = {
        config: { dsn: this.sentryConfig.dsn },
        level: this.logLevel,
      }
      logger.add(new Sentry(options))
    }
    return logger
  }
}
