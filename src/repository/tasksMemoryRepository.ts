import { TasksRepository } from './tasksRepository'
import { Sequelize } from 'sequelize'
import winston from 'winston'
import { MemoryClient } from '../client/database/memoryClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Either, EitherI } from '../model/either'
import { ApiError, Internal } from '../model/error'
import { Task, TaskCreation, TaskEdition, TasksFilters } from '../model/tasks'
import { DataWithPages, Pagination } from '../model/pagination'

export class TasksMemoryRepository implements TasksRepository {
  dbClient: Sequelize
  logger: winston.Logger

  constructor(memoryClient: MemoryClient, loggerConfig: LoggerConfig) {
    this.dbClient = memoryClient.client
    this.logger = loggerConfig.create(TasksMemoryRepository.name)
  }

  async insertTask(
    taskCreation: TaskCreation
  ): Promise<Either<ApiError, Task>> {
    return EitherI.Left(new Internal())
  }

  async updateTask(
    id: string,
    taskEdition: TaskEdition
  ): Promise<Either<ApiError, Task | null>> {
    return EitherI.Left(new Internal())
  }

  async getTasks(
    filters: TasksFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    return EitherI.Right({ data: [], pages: 1 })
  }

  async getTaskById(id: string): Promise<Either<ApiError, Task | null>> {
    return EitherI.Right(null)
  }

  async deleteTaskById(id: string): Promise<Either<ApiError, number>> {
    return EitherI.Right(1)
  }

  getGraphTasksResolver() {
    return () => 1
  }

  getGraphTaskPhaseResolver() {
    return () => 1
  }
}
