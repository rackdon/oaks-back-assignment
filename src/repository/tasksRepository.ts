/* eslint-disable  @typescript-eslint/no-explicit-any */

import winston from 'winston'
import { PostgresqlClient } from '../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Sequelize } from 'sequelize'
import { manageDbErrors } from './errors'
import { ApiError } from '../model/error'
import { Either, EitherI } from '../model/either'
import { Task, TaskCreation, TaskEdition, TasksFilters } from '../model/tasks'
import { DataWithPages, Pagination } from '../model/pagination'
import { getPages, getPaginationQuery } from './pagination'

export class TasksRepository {
  readonly logger: winston.Logger
  readonly pgClient: Sequelize

  constructor(pgClient: PostgresqlClient, loggerConfig: LoggerConfig) {
    this.pgClient = pgClient.client
    this.logger = loggerConfig.create(TasksRepository.name)
  }

  async insertTask({
    name,
    phaseId,
  }: TaskCreation): Promise<Either<ApiError, Task>> {
    const result = await EitherI.catchA(async () => {
      const result = await this.pgClient.models.Task.create({
        name,
        phaseId,
      })
      return result['dataValues']
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async updateTask(
    id: string,
    data: TaskEdition
  ): Promise<Either<ApiError, Task | null>> {
    const result = await EitherI.catchA(async () => {
      /* eslint-disable  @typescript-eslint/no-unused-vars */
      const [elems, resultArr] = await this.pgClient.models.Task.update(
        { ...data, updatedOn: new Date() },
        {
          where: { id },
          returning: true,
        }
      )
      const updatedModel = resultArr[0]
      return updatedModel ? updatedModel['dataValues'] : null
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  private getFilters(tasksFilters: TasksFilters): Record<string, any> {
    const filters = {}
    if (tasksFilters.name) {
      filters['name'] = tasksFilters.name
    }
    if (tasksFilters.done !== undefined) {
      filters['done'] = tasksFilters.done
    }
    if (tasksFilters.phaseId) {
      filters['phaseId'] = tasksFilters.phaseId
    }
    return filters
  }

  private extractTask(x): Task {
    const task = x.get()
    delete task.phase_id
    return task
  }

  async getTasks(
    filters: TasksFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    const paginationQuery = getPaginationQuery(pagination)
    const tasksFilters = this.getFilters(filters)
    const query = { ...paginationQuery, where: tasksFilters }
    const result = await EitherI.catchA(async () => {
      const phases = await this.pgClient.models.Task.findAndCountAll(query)
      return {
        data: phases.rows.map(this.extractTask),
        pages: getPages(phases.count, pagination.pageSize),
      }
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async getTaskById(id: string): Promise<Either<ApiError, Task | null>> {
    const result = await EitherI.catchA(async () => {
      const result = await this.pgClient.models.Task.findByPk(id)
      return result ? this.extractTask(result) : null
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async deleteTaskById(id: string): Promise<Either<ApiError, number>> {
    const result = await EitherI.catchA(async () => {
      return await this.pgClient.models.Task.destroy({ where: { id } })
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }
}
