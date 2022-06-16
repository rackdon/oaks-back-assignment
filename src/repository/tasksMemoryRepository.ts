import { TasksRepository } from './tasksRepository'
import { Sequelize } from 'sequelize'
import winston from 'winston'
import { MemoryClient } from '../client/database/memoryClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Either, EitherI } from '../model/either'
import { ApiError } from '../model/error'
import { Task, TaskCreation, TaskEdition, TasksFilters } from '../model/tasks'
import { DataWithPages, Pagination } from '../model/pagination'
import { randomUUID } from 'crypto'

export class TasksMemoryRepository implements TasksRepository {
  dbClient: Sequelize
  logger: winston.Logger
  readonly memoryClient: MemoryClient

  constructor(memoryClient: MemoryClient, loggerConfig: LoggerConfig) {
    this.memoryClient = memoryClient
    this.dbClient = memoryClient.client
    this.logger = loggerConfig.create(TasksMemoryRepository.name)
  }

  async insertTask(
    taskCreation: TaskCreation
  ): Promise<Either<ApiError, Task>> {
    const currentDate = new Date()
    const task: Task = {
      id: randomUUID(),
      name: taskCreation.name,
      phaseId: taskCreation.phaseId,
      done: false,
      createdOn: currentDate,
      updatedOn: currentDate,
    }
    this.memoryClient.getTasks().push(task)
    return EitherI.Right(task)
  }

  async updateTask(
    id: string,
    taskEdition: TaskEdition
  ): Promise<Either<ApiError, Task | null>> {
    this.memoryClient.getTasks().map((x) => {
      return x.id === id
        ? Object.assign(x, { ...x, ...taskEdition, updatedOn: new Date() })
        : x
    })
    const task = this.memoryClient.getTasks().find((x) => x.id === id)
    return EitherI.Right(task || null)
  }

  async getTasks(
    filters: TasksFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    return EitherI.Right({ data: [this.memoryClient.getTasks()], pages: 1 })
  }

  async getTaskById(id: string): Promise<Either<ApiError, Task | null>> {
    const task = this.memoryClient.getTasks().find((x) => x.id === id)

    return EitherI.Right(task || null)
  }

  async deleteTaskById(id: string): Promise<Either<ApiError, number>> {
    const index = this.memoryClient.getTasks().findIndex((x) => x.id === id)
    if (index !== -1) {
      this.memoryClient.getTasks().splice(index, 1)
      return EitherI.Right(1)
    } else {
      return EitherI.Right(0)
    }
  }

  getGraphTasksResolver() {
    return () => 1
  }

  getGraphTaskPhaseResolver() {
    return () => 1
  }
}
