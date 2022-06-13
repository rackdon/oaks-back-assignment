/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */

import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import {
  ApiError,
  BadRequest,
  Conflict,
  Internal,
  NotFound,
} from '../../model/error'
import { TasksService } from '../../service/tasks/tasksService'
import { Task } from '../../model/tasks'
import { DataWithPages } from '../../model/pagination'

export class TasksController {
  readonly tasksService: TasksService
  readonly logger: winston.Logger

  constructor(tasksService: TasksService, loggerConfig: LoggerConfig) {
    this.tasksService = tasksService
    this.logger = loggerConfig.create(TasksController.name)
  }

  createTask = async (req, res): Promise<void> => {
    const result = await this.tasksService.createTask(req.body)
    result.fold(
      (error: ApiError) => {
        switch (error.constructor) {
          case BadRequest: {
            res.status(400).json(error)
            break
          }
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      (task: Task) => res.status(201).json(task)
    )
  }

  editTask = async (req, res): Promise<void> => {
    const result = await this.tasksService.editTask(req.params.id, req.body)
    result.fold(
      (error: ApiError) => {
        switch (error.constructor) {
          case BadRequest: {
            res.status(400).json(error)
            break
          }
          case NotFound: {
            res.status(404).send()
            break
          }
          case Conflict: {
            res.status(409).json(error)
            break
          }
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      (task: Task) => res.status(200).json(task)
    )
  }

  getTasks = async (req, res): Promise<void> => {
    const result = await this.tasksService.getTasks(req.query)
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case BadRequest: {
            res.status(400).json(error)
            break
          }
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      (tasks: DataWithPages<Task>) => res.status(200).json(tasks)
    )
  }

  getTaskById = async (req, res): Promise<void> => {
    const result = await this.tasksService.getTaskById(req.params.id)
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case NotFound: {
            res.status(404).send()
            break
          }
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      (task: Task) => res.status(200).json(task)
    )
  }

  deleteTaskById = async (req, res): Promise<void> => {
    const result = await this.tasksService.deleteTaskById(req.params.id)
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      () => res.status(204).send()
    )
  }
}
