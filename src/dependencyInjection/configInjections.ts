import { SentryConfig } from '../configuration/sentryConfig'
import { LoggerConfig } from '../configuration/loggerConfig'
import { ServerConfig } from '../configuration/serverConfig'
import { PostgresqlConfig } from '../configuration/postgresqlConfig'

const sentryConfig = new SentryConfig()
const loggerConfig = new LoggerConfig(null, sentryConfig)
const serverConfig = new ServerConfig()
const postgresqlConfig = new PostgresqlConfig()

export { serverConfig, sentryConfig, loggerConfig, postgresqlConfig }
