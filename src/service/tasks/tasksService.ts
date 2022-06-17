import winston from 'winston'
import { Either, EitherI } from '../../model/either'
import { ApiError, BadRequest, NotFound } from '../../model/error'
import {
  PaginatedTasksFilters,
  Task,
  TaskCreation,
  TaskEdition,
  toTasksFilters,
} from '../../model/tasks'
import { DataWithPages, toPagination } from '../../model/pagination'
import { TasksRepository } from '../../repository/tasks/tasksRepository'
import { PhasesRepository } from '../../repository/phases/phasesRepository'
import { Logger } from '../server/logger'

export class TasksService {
  readonly logger: Logger
  readonly tasksRepository: TasksRepository
  readonly phasesRepository: PhasesRepository

  constructor(
    tasksRepository: TasksRepository,
    phasesRepository: PhasesRepository,
    loggerConfig: winston.Logger
  ) {
    this.logger = new Logger(TasksService.name, loggerConfig)
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
      if (phase) {
        if (phase.done) {
          await this.phasesRepository.updatePhase(phase.id, { done: false })
        }
        return await this.tasksRepository.insertTask(taskCreation)
      } else {
        return EitherI.Left(new BadRequest(['related phase does not exist']))
      }
    })
    return result.bind()
  }

  async editTask(
    id: string,
    taskEdition: TaskEdition
  ): Promise<Either<ApiError, Task>> {
    try {
      const currentTask = (await this.getTaskById(id)).getOrThrow()
      if ('done' in taskEdition) {
        const currentPhase = (
          await this.phasesRepository.getPhaseById(
            currentTask.phaseId,
            'PhaseRaw'
          )
        ).getOrThrow()
        const undonePhases = (
          await this.phasesRepository.getPhases(
            'PhaseRaw',
            { createdBefore: currentPhase.createdOn, done: false },
            toPagination({ pageSize: 1 })
          )
        ).getOrThrow()
        if (undonePhases.data.length > 0) {
          return EitherI.Left(new BadRequest(['previous phases must be done']))
        }
        const updatedTask = (
          await this.tasksRepository.updateTask(id, taskEdition)
        ).getOrThrow()

        // TODO From this point database get or updates could fail and could not update the associated phase if should be done.
        // TODO One solution could be manage the errors with mapLeft and make a rollback but it depends on business needs
        const undoneTasks = (
          await this.tasksRepository.getTasks(
            { phaseId: currentTask.phaseId, done: false },
            toPagination({ pageSize: 1 })
          )
        ).extract()
        if (undoneTasks.data.length === 0) {
          await this.phasesRepository.updatePhase(currentTask.phaseId, {
            done: true,
          })
        }
        return EitherI.Right(updatedTask)
      } else {
        return this.tasksRepository.updateTask(id, taskEdition)
      }
    } catch (e) {
      return EitherI.Left(e)
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

  getGraphTasksResolver() {
    return this.tasksRepository.getGraphTasksResolver()
  }

  getGraphTaskPhaseResolver() {
    return this.tasksRepository.getGraphTaskPhaseResolver()
  }
}
