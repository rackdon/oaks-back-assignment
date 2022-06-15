import { PhasesRepository } from './phasesRepository'
import { Either, EitherI } from '../model/either'
import { ApiError, Conflict } from '../model/error'
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
import { randomUUID } from 'crypto'
import { Task } from '../model/tasks'

export class PhasesMemoryRepository implements PhasesRepository {
  readonly logger: winston.Logger
  readonly dbClient: Sequelize
  readonly memoryClient: MemoryClient

  constructor(memoryClient: MemoryClient, loggerConfig: LoggerConfig) {
    this.memoryClient = memoryClient
    this.dbClient = memoryClient.client
    this.logger = loggerConfig.create(PhasesMemoryRepository.name)
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
    let phase = this.memoryClient.getPhases().find((x) => x.id === id)
    if (phase) {
      phase = { ...phase, ...phaseEdition, updatedOn: new Date() }
      return EitherI.Right(phase)
    } else {
      return EitherI.Right(null)
    }
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
    const phase = this.memoryClient.getPhases().find((x) => x.id === id)
    if (phase) {
      if (projection === 'PhaseRaw') {
        return EitherI.Right(phase)
      } else {
        const tasks: Omit<Task, 'phaseId'>[] = this.memoryClient
          .getTasks()
          .filter((x) => x.phaseId === id)
          .map((task: Omit<Task, 'phaseId'>) => {
            delete task['phaseId']
            return task
          })
        return EitherI.Right({ ...phase, tasks: tasks })
      }
    } else {
      return EitherI.Right(null)
    }
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
