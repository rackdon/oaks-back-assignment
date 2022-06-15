import { Sequelize } from 'sequelize'
import winston from 'winston'

export interface DatabaseClient {
  client: Sequelize
  logger: winston.Logger
  isClosed(): boolean
  closeConnection(): Promise<void>
}
