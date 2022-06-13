import { pgClient } from './postgresqlInjections'
import { loggerConfig } from './configInjections'
import { TasksRepository } from '../repository/tasksRepository'
import { TasksService } from '../service/tasks/tasksService'
import { TasksController } from '../controller/tasks/tasksController'
import { phasesRepository } from './phasesInjections'

const tasksRepository = new TasksRepository(pgClient, loggerConfig)
const tasksService = new TasksService(
  tasksRepository,
  phasesRepository,
  loggerConfig
)
const tasksController = new TasksController(tasksService, loggerConfig)

export { tasksRepository, tasksService, tasksController }
