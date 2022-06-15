import { dbClient } from './postgresqlInjections'
import { loggerConfig } from './configInjections'
import { TasksDbRepository } from '../repository/tasksDbRepository'
import { TasksService } from '../service/tasks/tasksService'
import { TasksController } from '../controller/tasks/tasksController'
import { phasesRepository } from './phasesInjections'
import { PostgresqlClient } from '../client/database/postgresqlClient'
import { TasksMemoryRepository } from '../repository/tasksMemoryRepository'

const tasksRepository =
  dbClient.constructor === PostgresqlClient
    ? new TasksDbRepository(dbClient, loggerConfig)
    : new TasksMemoryRepository(dbClient, loggerConfig)
const tasksService = new TasksService(
  tasksRepository,
  phasesRepository,
  loggerConfig
)
const tasksController = new TasksController(tasksService, loggerConfig)

export { tasksRepository, tasksService, tasksController }
