import { TasksRepository } from './tasksRepository'
import { Sequelize } from 'sequelize'
import winston from 'winston'
import { MemoryClient } from '../../client/database/memoryClient'
import { Either, EitherI } from '../../model/either'
import { ApiError } from '../../model/error'
import {
  Task,
  TaskCreation,
  TaskEdition,
  TasksFilters,
} from '../../model/tasks'
import { DataWithPages, Pagination, SortDir } from '../../model/pagination'
import { randomUUID } from 'crypto'
import { Logger } from '../../service/server/logger'
import { getPages } from '../pagination'

export class TasksMemoryRepository implements TasksRepository {
  dbClient: Sequelize
  logger: Logger
  readonly memoryClient: MemoryClient

  constructor(memoryClient: MemoryClient, loggerConfig: winston.Logger) {
    this.memoryClient = memoryClient
    this.dbClient = memoryClient.client
    this.logger = new Logger(TasksMemoryRepository.name, loggerConfig)
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

  // TODO For the moment only sort by one param will be applied
  private getSort(
    sort: string,
    sortDir: SortDir
  ): (a: Task, b: Task) => number {
    return (a: Task, b: Task): number => {
      switch (sortDir) {
        case 'ASC':
          return a[sort] < b[sort] ? -1 : 1
        case 'DESC':
          return a[sort] < b[sort] ? 1 : -1
        default:
          return a[sort] < b[sort] ? 1 : -1
      }
    }
  }

  private getFilters(filters: TasksFilters): (task: Task) => boolean {
    return (task: Task) => {
      return (
        (filters.name ? task.name === filters.name : true) &&
        (filters.done !== undefined ? task.done === filters.done : true) &&
        (filters.phaseId ? task.phaseId === filters.phaseId : true)
      )
    }
  }

  async getTasks(
    filters: TasksFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    const filteredTasks = this.memoryClient
      .getTasks()
      .filter(this.getFilters(filters))
      .sort(this.getSort(pagination.sort[0], pagination.sortDir || 'DESC'))
    const startTask = pagination.page * pagination.pageSize
    const endTask = startTask + pagination.pageSize
    return EitherI.Right({
      data: filteredTasks.slice(startTask, endTask),
      pages: getPages(filteredTasks.length, pagination.pageSize),
    })
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
    /* eslint-disable  @typescript-eslint/no-unused-vars */
    return (a, args, b, context) => {
      const tasks = this.memoryClient.getTasks()
      switch (context.fieldName) {
        case 'tasks':
          return tasks
            .filter(this.getFilters(args))
            .sort(
              this.getSort(
                args.order?.split('reverse:').reverse()[0],
                args.order?.startsWith('reverse:') ? 'DESC' : 'ASC'
              )
            )
            .slice(
              args.offset,
              (args.offset || 0) + (args.limit || tasks.length)
            )
        case 'task':
          return tasks.filter((x) => x.id === args.id)[0]
      }
    }
  }

  getGraphTaskPhaseResolver() {
    /* eslint-disable  @typescript-eslint/no-unused-vars */
    return (task, a, b, context) => {
      return this.memoryClient
        .getPhases()
        .filter((x) => x.id == task.phaseId)[0]
    }
  }
}
