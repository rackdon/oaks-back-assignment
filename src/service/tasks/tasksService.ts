import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Either, EitherI } from '../../model/either'
import { ApiError, NotFound } from '../../model/error'
import { TasksRepository } from '../../repository/tasksRepository'
import {
  PaginatedTasksFilters,
  Task,
  TaskCreation,
  toTasksFilters,
} from '../../model/tasks'
import { DataWithPages, toPagination } from '../../model/pagination'

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

  async getTasks(
    filters: PaginatedTasksFilters
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    const tasksFilters = toTasksFilters(filters)
    const paginationFilters = toPagination(filters)
    return this.tasksRepository.getTasks(tasksFilters, paginationFilters)
  }

  async getTaskById(id: string): Promise<Either<ApiError, Task>> {
    const result = await this.tasksRepository.getTaskById(id)
    return result
      .map((task: Task | null) => {
        return task ? task : EitherI.Left(new NotFound())
      })
      .bind()
  }

  async deleteTaskById(id: string): Promise<Either<ApiError, number>> {
    return this.tasksRepository.deleteTaskById(id)
  }
}
