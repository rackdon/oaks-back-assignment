import { DatabaseClient } from './databaseClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Sequelize } from 'sequelize'
import winston from 'winston'

export class MemoryClient implements DatabaseClient {
  client: Sequelize
  logger: winston.Logger

  constructor(loggerConfig: LoggerConfig) {
    this.client = new Sequelize({ dialect: 'postgres' })
    this.logger = loggerConfig.create(MemoryClient.name)
    this.logger.info('Memory DB connected')
  }

  closeConnection(): Promise<void> {
    return Promise.resolve(undefined)
  }

  isClosed(): boolean {
    return false
  }
}
