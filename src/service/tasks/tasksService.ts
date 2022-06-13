import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { Either, EitherI } from '../../model/either'
import { ApiError, BadRequest, NotFound } from '../../model/error'
import { TasksRepository } from '../../repository/tasksRepository'
import {
  PaginatedTasksFilters,
  Task,
  TaskCreation,
  TaskEdition,
  toTasksFilters,
} from '../../model/tasks'
import { DataWithPages, toPagination } from '../../model/pagination'
import { PhasesRepository } from '../../repository/phasesRepository'

export class TasksService {
  readonly logger: winston.Logger
  readonly tasksRepository: TasksRepository
  readonly phasesRepository: PhasesRepository

  constructor(
    tasksRepository: TasksRepository,
    phasesRepository: PhasesRepository,
    loggerConfig: LoggerConfig
  ) {
    this.logger = loggerConfig.create(TasksService.name)
    this.tasksRepository = tasksRepository
    this.phasesRepository = phasesRepository
  }

  async createTask(
    taskCreation: TaskCreation
  ): Promise<Either<ApiError, Task>> {
    const relatedPhase = await this.phasesRepository.getPhaseById(
      taskCreation.phaseId,
      'PhaseRaw'
    )
    const result = await relatedPhase.mapA(async (phase) => {
      return phase
        ? phase.done
          ? EitherI.Left(new BadRequest(['related phase is already done']))
          : await this.tasksRepository.insertTask(taskCreation)
        : EitherI.Left(new BadRequest(['related phase does not exist']))
    })
    return result.bind()
  }

  async editTask(
    id: string,
    taskEdition: TaskEdition
  ): Promise<Either<ApiError, Task>> {
    const taskResult = await this.getTaskById(id)
    if ('done' in taskEdition) {
      const updateResult = await taskResult.mapA(async (task) => {
        const currentPhase = await this.phasesRepository.getPhaseById(
          task.phaseId,
          'PhaseRaw'
        )
        const previousPhases = await currentPhase.mapA(async (currentPhase) => {
          return await this.phasesRepository.getPhases(
            'PhaseRaw',
            { createdBefore: currentPhase.createdOn },
            toPagination({})
          )
        })
        const finalResult = await previousPhases.bind().mapA(async (phases) => {
          return phases.data.some((x) => !x.done)
            ? EitherI.Left(new BadRequest(['previous phases must be done']))
            : await this.tasksRepository.updateTask(id, taskEdition)
        })
        return finalResult.bind()
      })
      return updateResult.bind()
    } else {
      const updateResult = await taskResult.mapA(() => {
        return this.tasksRepository.updateTask(id, taskEdition)
      })
      return updateResult.bind()
    }
  }

  async getTasks(
    filters: PaginatedTasksFilters
  ): Promise<Either<ApiError, DataWithPages<Task>>> {
    const tasksFilters = toTasksFilters(filters)
    const paginationFilters = toPagination(filters)
    return this.tasksRepository.getTasks(tasksFilters, paginationFilters)
  }

  async getTaskById(id: string): Promise<Either<ApiError, Task>> {
    const result = await this.tasksRepository.getTaskById(id)
    return result
      .map((task: Task | null) => {
        return task ? task : EitherI.Left(new NotFound())
      })
      .bind()
  }

  async deleteTaskById(id: string): Promise<Either<ApiError, number>> {
    return this.tasksRepository.deleteTaskById(id)
  }
}
