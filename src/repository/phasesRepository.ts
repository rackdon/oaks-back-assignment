/* eslint-disable  @typescript-eslint/no-explicit-any */

import winston from 'winston'
import { PostgresqlClient } from '../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Op, Sequelize } from 'sequelize'
import { manageDbErrors } from './errors'
import { ApiError } from '../model/error'
import { Either, EitherI } from '../model/either'
import {
  Phase,
  PhaseCreation,
  PhaseProjection,
  PhasesFilters,
} from '../model/phases'
import { DataWithPages, Pagination } from '../model/pagination'
import { getPages, getPaginationQuery } from './pagination'

export class PhasesRepository {
  readonly logger: winston.Logger
  readonly pgClient: Sequelize

  constructor(pgClient: PostgresqlClient, loggerConfig: LoggerConfig) {
    this.pgClient = pgClient.client
    this.logger = loggerConfig.create(PhasesRepository.name)
  }

  async insertPhase({ name }: PhaseCreation): Promise<Either<ApiError, Phase>> {
    const result = await EitherI.catchA(async () => {
      const result = await this.pgClient.models.Phase.create({
        name,
      })
      return result['dataValues']
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
      filters['createdOn'] = { [Op.lte]: phasesFilters.createdBefore }
    }
    if (phasesFilters.createdAfter) {
      filters['createdOn'] = { [Op.gte]: phasesFilters.createdAfter }
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
      ...this.getInclude(projection, this.pgClient),
    }
    const result = await EitherI.catchA(async () => {
      const phases = await this.pgClient.models.Phase.findAndCountAll(query)
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
      const result = await this.pgClient.models.Phase.findByPk(id, {
        ...this.getInclude(projection, this.pgClient),
      })
      return result ? this.extractPhase(result) : null
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }

  async deletePhaseById(id: string): Promise<Either<ApiError, number>> {
    const result = await EitherI.catchA(async () => {
      return await this.pgClient.models.Phase.destroy({ where: { id } })
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }
}
