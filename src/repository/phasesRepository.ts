/* eslint-disable  @typescript-eslint/no-explicit-any */

import winston from 'winston'
import { PostgresqlClient } from '../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../configuration/loggerConfig'
import { Op, Sequelize } from 'sequelize'
import { manageDbErrors } from './errors'
import { ApiError } from '../model/error'
import { Either, EitherI } from '../model/either'
import { Phase, PhaseCreation, PhasesFilters } from '../model/phases'
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

  async getPhases(
    filters: PhasesFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    const paginationQuery = getPaginationQuery(pagination)
    const phaseFilters = this.getFilters(filters)
    const query = { ...paginationQuery, where: phaseFilters }
    const result = await EitherI.catchA(async () => {
      const phases = await this.pgClient.models.Phase.findAndCountAll(query)
      return {
        data: phases.rows.map((x) => x.get()),
        pages: getPages(phases.count, pagination.pageSize),
      }
    })
    return result.mapLeft((e) => {
      return manageDbErrors(e, this.logger)
    })
  }
}
