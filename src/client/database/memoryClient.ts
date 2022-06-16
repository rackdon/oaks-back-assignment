import { DatabaseClient } from './databaseClient'
import { Sequelize } from 'sequelize'
import winston from 'winston'
import { PhaseRaw } from '../../model/phases'
import { Task } from '../../model/tasks'
import { Logger } from '../../service/server/logger'

export class MemoryClient implements DatabaseClient {
  readonly client: Sequelize
  readonly logger: Logger
  private phases: PhaseRaw[] = []
  private tasks: Task[] = []

  constructor(loggerConfig: winston.Logger) {
    this.client = new Sequelize({ dialect: 'postgres' })
    this.logger = new Logger(MemoryClient.name, loggerConfig)
    this.logger.info('Memory DB connected')
  }

  closeConnection(): Promise<void> {
    return Promise.resolve(undefined)
  }

  isClosed(): boolean {
    return false
  }

  getPhases(): PhaseRaw[] {
    return this.phases
  }

  getTasks(): Task[] {
    return this.tasks
  }
}
