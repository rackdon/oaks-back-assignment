import { PhasesRepository } from './phasesRepository'
import { Either, EitherI } from '../../model/either'
import { ApiError, Conflict, Forbidden } from '../../model/error'
import {
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhaseRaw,
  PhasesFilters,
  PhaseWithTasks,
} from '../../model/phases'
import { DataWithPages, Pagination } from '../../model/pagination'
import { MemoryClient } from '../../client/database/memoryClient'
import winston from 'winston'
import { Sequelize } from 'sequelize'
import { randomUUID } from 'crypto'
import { Task } from '../../model/tasks'
import { Logger } from '../../service/server/logger'
import { getPages } from '../pagination'

export class PhasesMemoryRepository implements PhasesRepository {
  readonly logger: Logger
  readonly dbClient: Sequelize
  readonly memoryClient: MemoryClient

  constructor(memoryClient: MemoryClient, loggerConfig: winston.Logger) {
    this.memoryClient = memoryClient
    this.dbClient = memoryClient.client
    this.logger = new Logger(PhasesMemoryRepository.name, loggerConfig)
  }

  async insertPhase(
    phaseCreation: PhaseCreation
  ): Promise<Either<ApiError, PhaseRaw>> {
    const currentDate = new Date()
    const phase: PhaseRaw = {
      id: randomUUID(),
      name: phaseCreation.name,
      done: false,
      createdOn: currentDate,
      updatedOn: currentDate,
    }
    if (
      this.memoryClient.getPhases().some((x) => x.name === phaseCreation.name)
    ) {
      return EitherI.Left(
        new Conflict([`phase ${phaseCreation.name} already exists`])
      )
    } else {
      this.memoryClient.getPhases().push(phase)
      return EitherI.Right(phase)
    }
  }

  async updatePhase(
    id: string,
    phaseEdition: PhaseEdition
  ): Promise<Either<ApiError, PhaseRaw>> {
    this.memoryClient.getPhases().map((x) => {
      return x.id === id
        ? Object.assign(x, { ...x, ...phaseEdition, updatedOn: new Date() })
        : x
    })
    const phase = this.memoryClient.getPhases().find((x) => x.id === id)
    return EitherI.Right(phase || null)
  }

  async getPhases(
    projection: PhaseProjection,
    filters: PhasesFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Phase>>> {
    const filteredPhases = this.memoryClient.getPhases()
    return EitherI.Right({
      data: filteredPhases,
      pages: getPages(filteredPhases.length, pagination.pageSize),
    })
  }

  private enrichPhase(phase: PhaseRaw): PhaseWithTasks {
    const tasks: Omit<Task, 'phaseId'>[] = this.memoryClient
      .getTasks()
      .filter((x) => x.phaseId === phase.id)
      .map(({ id, name, done, createdOn, updatedOn }) => {
        return { id, name, done, createdOn, updatedOn }
      })
    return { ...phase, tasks: tasks }
  }

  async getPhaseById(
    id: string,
    projection: PhaseProjection
  ): Promise<Either<ApiError, Phase | null>> {
    const phase = this.memoryClient.getPhases().find((x) => x.id === id)
    if (phase) {
      return projection === 'PhaseRaw'
        ? EitherI.Right(phase)
        : EitherI.Right(this.enrichPhase(phase))
    } else {
      return EitherI.Right(null)
    }
  }

  async deletePhaseById(id: string): Promise<Either<ApiError, number>> {
    if (this.memoryClient.getTasks().some((x) => x.phaseId === id)) {
      return EitherI.Left(new Forbidden())
    } else {
      const index = this.memoryClient.getPhases().findIndex((x) => x.id === id)
      if (index !== -1) {
        this.memoryClient.getPhases().splice(index, 1)
        return EitherI.Right(1)
      } else {
        return EitherI.Right(0)
      }
    }
  }

  getGraphPhasesResolver() {
    return () => 1
  }

  getGraphPhasesTasks() {
    return () => 1
  }
}
