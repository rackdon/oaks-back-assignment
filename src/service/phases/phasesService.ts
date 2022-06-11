import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Either } from '../../model/either'
import { ApiError } from '../../model/error'
import { PhasesRepository } from '../../repository/phasesRepository'
import {
  PaginatedPhasesFilters,
  Phase,
  PhaseCreation,
  toPhasesFilters,
} from '../../model/phases'
import { DataWithPages, toPagination } from '../../model/pagination'

export class PhasesService {
  readonly logger: winston.Logger
  readonly phasesRepository: PhasesRepository

  constructor(phasesRepository: PhasesRepository, loggerConfig: LoggerConfig) {
    this.logger = loggerConfig.create(PhasesService.name)
    this.phasesRepository = phasesRepository
  }

  async createPhase(
    phaseCreation: PhaseCreation
  ): Promise<Either<ApiError, Phase>> {
    return this.phasesRepository.insertPhase(phaseCreation)
  }

  async getPhases(
    filters: PaginatedPhasesFilters
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    const phasesFilters = toPhasesFilters(filters)
    const paginationFilters = toPagination(filters)
    return this.phasesRepository.getPhases(phasesFilters, paginationFilters)
  }
}
