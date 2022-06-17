import winston from 'winston'
import { Either, EitherI } from '../../model/either'
import { ApiError, BadRequest, NotFound } from '../../model/error'
import {
  PaginatedPhasesFilters,
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhaseRaw,
  toPhasesFilters,
} from '../../model/phases'
import { DataWithPages, toPagination } from '../../model/pagination'
import { PhasesRepository } from '../../repository/phases/phasesRepository'
import { Logger } from '../server/logger'

export class PhasesService {
  readonly logger: Logger
  readonly phasesRepository: PhasesRepository
  readonly defaultPhase: PhaseProjection = 'PhaseRaw'

  constructor(
    phasesRepository: PhasesRepository,
    loggerConfig: winston.Logger
  ) {
    this.logger = new Logger(PhasesService.name, loggerConfig)
    this.phasesRepository = phasesRepository
  }

  async createPhase(
    phaseCreation: PhaseCreation
  ): Promise<Either<ApiError, PhaseRaw>> {
    return this.phasesRepository.insertPhase(phaseCreation)
  }

  async editPhase(
    id: string,
    phaseEdition: PhaseEdition
  ): Promise<Either<ApiError, PhaseRaw>> {
    if ('done' in phaseEdition) {
      const phaseResult = await this.getPhaseById(id, {
        projection: 'PhaseWithTasks',
      })
      const findResult = await phaseResult
        .map((phase) => {
          return phase.tasks.filter((task) => !task.done).length === 0
            ? phase
            : EitherI.Left(new BadRequest(['all tasks must be done']))
        })
        .bind()
        .mapA((phase) => {
          return this.phasesRepository.getPhases(
            'PhaseRaw',
            { createdBefore: phase.createdOn },
            toPagination({})
          )
        })
      const editionResult = await findResult.bind().mapA(async (phases) => {
        return phases.data.some((x) => !x.done)
          ? EitherI.Left(new BadRequest(['previous phases must be done']))
          : await this.phasesRepository.updatePhase(id, phaseEdition)
      })
      return editionResult.bind()
    } else {
      const result = await this.phasesRepository.updatePhase(id, phaseEdition)
      return result
        .map((phase: Phase | null) => {
          return phase ? phase : EitherI.Left(new NotFound())
        })
        .bind()
    }
  }

  async getPhases(
    filters: PaginatedPhasesFilters
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    const phasesFilters = toPhasesFilters(filters)
    const paginationFilters = toPagination(filters)
    const projection: PhaseProjection = filters.projection || this.defaultPhase
    return this.phasesRepository.getPhases(
      projection,
      phasesFilters,
      paginationFilters
    )
  }

  async getPhaseById(
    id: string,
    { projection }: { projection?: PhaseProjection }
  ): Promise<Either<ApiError, Phase>> {
    const result = await this.phasesRepository.getPhaseById(
      id,
      projection || this.defaultPhase
    )
    return result
      .map((phase: Phase | null) => {
        return phase ? phase : EitherI.Left(new NotFound())
      })
      .bind()
  }

  async deletePhaseById(id: string): Promise<Either<ApiError, number>> {
    return this.phasesRepository.deletePhaseById(id)
  }

  getGraphPhasesResolver() {
    return this.phasesRepository.getGraphPhasesResolver()
  }

  getGraphPhasesTasksResolver() {
    return this.phasesRepository.getGraphPhasesTasks()
  }
}
