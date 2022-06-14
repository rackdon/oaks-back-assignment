import { ApiGraphController } from '../graphController/apiGraphController'
import { pgClient } from './postgresqlInjections'
import { phasesService } from './phasesInjections'
import { tasksService } from './tasksInjections'
import { loggerConfig } from './configInjections'

const apiGraphController = new ApiGraphController(
  pgClient,
  phasesService,
  tasksService,
  loggerConfig
)

export { apiGraphController }
