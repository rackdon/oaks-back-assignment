import { ApiGraphController } from '../graphController/apiGraphController'
import { phasesService } from './phasesInjections'
import { tasksService } from './tasksInjections'
import { loggerConfig } from './configInjections'

const apiGraphController = new ApiGraphController(
  phasesService,
  tasksService,
  loggerConfig
)

export { apiGraphController }
