import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Either } from '../../model/either'
import { ApiError } from '../../model/error'
import { TasksRepository } from '../../repository/tasksRepository'
import { Task, TaskCreation } from '../../model/tasks'

export class TasksService {
  readonly logger: winston.Logger
  readonly tasksRepository: TasksRepository

  constructor(tasksRepository: TasksRepository, loggerConfig: LoggerConfig) {
    this.logger = loggerConfig.create(TasksService.name)
    this.tasksRepository = tasksRepository
  }

  async createTask(
    taskCreation: TaskCreation
  ): Promise<Either<ApiError, Task>> {
    return this.tasksRepository.insertTask(taskCreation)
  }
}
