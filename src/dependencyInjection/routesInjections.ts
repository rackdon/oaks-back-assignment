import { phasesController } from './phasesInjections'
import { Routes } from '../routes/routes'
import { tasksController } from './tasksInjections'

const routes = new Routes(phasesController, tasksController)
export { routes }
