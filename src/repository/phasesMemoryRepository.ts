import { PhasesRepository } from './phasesRepository'
import { Either, EitherI } from '../model/either'
import { ApiError, Internal } from '../model/error'
import {
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhaseRaw,
  PhasesFilters,
} from '../model/phases'
import { DataWithPages, Pagination } from '../model/pagination'
import { LoggerConfig } from '../configuration/loggerConfig'
import { MemoryClient } from '../client/database/memoryClient'
import winston from 'winston'
import { Sequelize } from 'sequelize'

export class PhasesMemoryRepository implements PhasesRepository {
  readonly logger: winston.Logger
  readonly dbClient: Sequelize

  constructor(memoryClient: MemoryClient, loggerConfig: LoggerConfig) {
    this.dbClient = memoryClient.client
    this.logger = loggerConfig.create(PhasesMemoryRepository.name)
  }

  async insertPhase(
    phaseCreation: PhaseCreation
  ): Promise<Either<ApiError, PhaseRaw>> {
    return EitherI.Left(new Internal())
  }

  async updatePhase(
    id: string,
    phaseEdition: PhaseEdition
  ): Promise<Either<ApiError, PhaseRaw>> {
    return EitherI.Left(new Internal())
  }

  async getPhases(
    projection: PhaseProjection,
    filters: PhasesFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    return EitherI.Right({ data: [], pages: 1 })
  }

  async getPhaseById(
    id: string,
    projection: PhaseProjection
  ): Promise<Either<ApiError, Phase | null>> {
    return EitherI.Right(null)
  }

  async deletePhaseById(id: string): Promise<Either<ApiError, number>> {
    return EitherI.Right(1)
  }

  getGraphPhasesResolver() {
    return () => 1
  }

  getGraphPhasesTasks() {
    return () => 1
  }
}
