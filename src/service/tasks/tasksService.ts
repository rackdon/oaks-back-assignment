import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
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
import { TasksRepository } from '../../repository/tasksRepository'
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
    const currentTask = await this.getTaskById(id)
    if ('done' in taskEdition) {
      return (
        await currentTask.mapA(async (task) => {
          const currentPhase = await this.phasesRepository.getPhaseById(
            task.phaseId,
            'PhaseRaw'
          )
          const undonePhases = await currentPhase.mapA(async (currentPhase) => {
            return await this.phasesRepository.getPhases(
              'PhaseRaw',
              { createdBefore: currentPhase.createdOn, done: false },
              toPagination({ pageSize: 1 })
            )
          })
          const updateResult = (
            await undonePhases.bind().mapA(async (phases) => {
              return phases.data.length > 0
                ? EitherI.Left(new BadRequest(['previous phases must be done']))
                : await this.tasksRepository.updateTask(id, taskEdition)
            })
          ).bind()

          if (updateResult.isLeft()) {
            return updateResult
          } else {
            const undoneTasks = await this.tasksRepository.getTasks(
              { phaseId: task.phaseId, done: false },
              toPagination({ pageSize: 1 })
            )
            return (
              await undoneTasks.mapA(async (tasks) => {
                if (tasks.data.length === 0) {
                  await this.phasesRepository.updatePhase(task.phaseId, {
                    done: true,
                  })
                }
                return updateResult
              })
            ).bind()
          }
        })
      ).bind()
    } else {
      const updateResult = await currentTask.mapA(() => {
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

  getGraphTasksResolver() {
    return this.tasksRepository.getGraphTasksResolver()
  }

  getGraphTaskPhaseResolver() {
    return this.tasksRepository.getGraphTaskPhaseResolver()
  }
}
