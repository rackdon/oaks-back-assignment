import winston from 'winston'
import { PostgresqlConfig } from '../../configuration/postgresqlConfig'
import { Sequelize } from 'sequelize'
import { EntitiesInitializer } from '../../repository/entity/entitiesInitializer'
import { types } from 'pg'
import { DatabaseClient } from './databaseClient'
import { Logger } from '../../service/server/logger'

export class PostgresqlClient implements DatabaseClient {
  readonly client: Sequelize
  readonly logger: Logger
  private closedConnection = true

  private constructor(config: PostgresqlConfig, loggerConfig: winston.Logger) {
    const dbLogger = config.log ? new Logger('DB', loggerConfig) : null
    this.client = new Sequelize({
      dialect: 'postgres',
      host: config.host,
      port: config.port,
      database: config.name,
      username: config.username,
      password: config.password,
      logging: config.log ? (...msg) => dbLogger!!.debug(msg.join()) : false,
    })
    this.logger = new Logger(PostgresqlClient.name, loggerConfig)
  }
  static Create(
    config: PostgresqlConfig,
    loggerConfig: winston.Logger
  ): PostgresqlClient {
    const instance = new PostgresqlClient(config, loggerConfig)

    types.setTypeParser(1114, (str: string) => new Date(`${str} GMT+0000`))
    instance.client.validate().then(() => {
      instance.closedConnection = false
      instance.logger.info('DB connected')
    })
    new EntitiesInitializer(instance.client)
    return instance
  }

  static async CreateAsync(
    config: PostgresqlConfig,
    loggerConfig: winston.Logger
  ): Promise<PostgresqlClient> {
    const instance = new PostgresqlClient(config, loggerConfig)

    instance.closedConnection = false
    await instance.client.validate()
    new EntitiesInitializer(instance.client)
    instance.logger.info('DB connected')
    return instance
  }

  isClosed(): boolean {
    return this.closedConnection
  }

  async closeConnection(): Promise<void> {
    await this.client.close()
    this.logger.info('DB disconnected')
  }
}
