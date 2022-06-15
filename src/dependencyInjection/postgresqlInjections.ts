import { loggerConfig, postgresqlConfig } from './configInjections'
import { PostgresqlClient } from '../client/database/postgresqlClient'
import { MemoryClient } from '../client/database/memoryClient'

const dbClient = postgresqlConfig.dbMemory
  ? new MemoryClient(loggerConfig)
  : PostgresqlClient.Create(postgresqlConfig, loggerConfig)

export { dbClient }
