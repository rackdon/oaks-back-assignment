/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */

import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { ApiError, BadRequest, Internal } from '../../model/error'
import { TasksService } from '../../service/tasks/tasksService'
import { Task } from '../../model/tasks'

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
}
