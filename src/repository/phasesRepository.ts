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
import { Sequelize } from 'sequelize'
import { Logger } from '../service/server/logger'

export interface PhasesRepository {
  logger: Logger
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
