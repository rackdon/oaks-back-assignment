import {
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhaseRaw,
  PhasesFilters,
} from '../model/phases'
import { ApiError } from '../model/error'
import { Either } from '../model/either'
import { DataWithPages, Pagination } from '../model/pagination'
import winston from 'winston'
import { Sequelize } from 'sequelize'

export interface PhasesRepository {
  logger: winston.Logger
  dbClient: Sequelize
  insertPhase(phaseCreation: PhaseCreation): Promise<Either<ApiError, PhaseRaw>>
  updatePhase(
    id: string,
    phaseEdition: PhaseEdition
  ): Promise<Either<ApiError, PhaseRaw | null>>
  getPhases(
    projection: PhaseProjection,
    filters: PhasesFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Phase>>>
  getPhaseById(
    id: string,
    projection: PhaseProjection
  ): Promise<Either<ApiError, Phase | null>>
  deletePhaseById(id: string): Promise<Either<ApiError, number>>
  getGraphPhasesResolver()
  getGraphPhasesTasks()
}
