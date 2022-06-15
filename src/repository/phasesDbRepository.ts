/* eslint-disable  @typescript-eslint/no-explicit-any */

import winston from 'winston'
import { PostgresqlClient } from '../client/database/postgresqlClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Op, Sequelize } from 'sequelize'
import { manageDbErrors } from './errors'
import { ApiError } from '../model/error'
import { Either, EitherI } from '../model/either'
import {
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhaseRaw,
  PhasesFilters,
} from '../model/phases'
import { DataWithPages, Pagination } from '../model/pagination'
import { getPages, getPaginationQuery } from './pagination'
import { resolver } from 'graphql-sequelize'
import { PhasesRepository } from './phasesRepository'

export class PhasesDbRepository implements PhasesRepository {
  readonly logger: winston.Logger
  readonly dbClient: Sequelize

  constructor(pgClient: PostgresqlClient, loggerConfig: LoggerConfig) {
    this.dbClient = pgClient.client
    this.logger = loggerConfig.create(PhasesDbRepository.name)
  }

  async insertPhase({
    name,
  }: PhaseCreation): Promise<Either<ApiError, PhaseRaw>> {
    const result = await EitherI.catchA(async () => {
      const date = new Date()
      const result = await this.dbClient.models.Phase.create({
        name,
        createdOn: date,
        updatedOn: date,
      })
      return result['dataValues']
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async updatePhase(
    id: string,
    data: PhaseEdition
  ): Promise<Either<ApiError, PhaseRaw | null>> {
    const result = await EitherI.catchA(async () => {
      /* eslint-disable  @typescript-eslint/no-unused-vars */
      const [elems, resultArr] = await this.dbClient.models.Phase.update(
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

  private getFilters(phasesFilters: PhasesFilters): Record<string, any> {
    const filters = {}
    if (phasesFilters.name) {
      filters['name'] = phasesFilters.name
    }
    if (phasesFilters.done !== undefined) {
      filters['done'] = phasesFilters.done
    }
    if (phasesFilters.createdBefore) {
      filters['createdOn'] = { [Op.lt]: phasesFilters.createdBefore }
    }
    if (phasesFilters.createdAfter) {
      filters['createdOn'] = { [Op.gt]: phasesFilters.createdAfter }
    }
    return filters
  }

  private getInclude(
    projection: PhaseProjection,
    pgClient: Sequelize
  ): Record<string, unknown> {
    switch (projection) {
      case 'PhaseRaw':
        return {}
      case 'PhaseWithTasks':
        return { include: { model: pgClient.models.Task, as: 'tasks' } }
    }
  }

  private extractPhase(phaseModel): Phase {
    const phase = phaseModel.get()
    if (phase.tasks) {
      phase.tasks = phase.tasks.map((taskModel) => {
        const task = taskModel.get()
        delete task.phase_id
        delete task.phaseId
        return task
      })
    }
    return phase
  }

  async getPhases(
    projection: PhaseProjection,
    filters: PhasesFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    const paginationQuery = getPaginationQuery(pagination)
    const phaseFilters = this.getFilters(filters)
    const query = {
      ...paginationQuery,
      where: phaseFilters,
      ...this.getInclude(projection, this.dbClient),
    }
    const result = await EitherI.catchA(async () => {
      const phases = await this.dbClient.models.Phase.findAndCountAll(query)
      return {
        data: phases.rows.map(this.extractPhase),
        pages: getPages(phases.count, pagination.pageSize),
      }
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async getPhaseById(
    id: string,
    projection: PhaseProjection
  ): Promise<Either<ApiError, Phase | null>> {
    const result = await EitherI.catchA(async () => {
      const result = await this.dbClient.models.Phase.findByPk(id, {
        ...this.getInclude(projection, this.dbClient),
      })
      return result ? this.extractPhase(result) : null
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async deletePhaseById(id: string): Promise<Either<ApiError, number>> {
    const result = await EitherI.catchA(async () => {
      return await this.dbClient.models.Phase.destroy({ where: { id } })
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  getGraphPhasesResolver() {
    return resolver(this.dbClient.models.Phase, {
      before: (findOptions, args) => {
        findOptions.where = findOptions.where || {}
        if (args.createdBefore) {
          findOptions.where.createdOn = { [Op.lt]: args.createdBefore }
        }
        if (args.createdAfter) {
          findOptions.where.createdOn = { [Op.gt]: args.createdBefore }
        }
        return findOptions
      },
    })
  }

  getGraphPhasesTasks() {
    return resolver(this.dbClient.models.Phase['tasks'])
  }
}
