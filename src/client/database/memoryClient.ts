import { DatabaseClient } from './databaseClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Sequelize } from 'sequelize'
import winston from 'winston'
import { PhaseRaw } from '../../model/phases'
import { Task } from '../../model/tasks'

export class MemoryClient implements DatabaseClient {
  readonly client: Sequelize
  readonly logger: winston.Logger
  private phases: PhaseRaw[] = []
  private tasks: Task[] = []

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

  getPhases(): PhaseRaw[] {
    return this.phases
  }

  getTasks(): Task[] {
    return this.tasks
  }
}
