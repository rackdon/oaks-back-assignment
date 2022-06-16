import { Sequelize } from 'sequelize'
import { Logger } from '../../service/server/logger'

export interface DatabaseClient {
  client: Sequelize
  logger: Logger
  isClosed(): boolean
  closeConnection(): Promise<void>
}
