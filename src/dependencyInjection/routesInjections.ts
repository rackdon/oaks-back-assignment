import { phasesController } from './phasesInjections'
import { Routes } from '../routes/routes'
import { tasksController } from './tasksInjections'
import { GraphRoutes } from '../routes/graphRoutes'
import { apiGraphController } from './graphControllerInjections'

const routes = new Routes(phasesController, tasksController)
const graphRoutes = new GraphRoutes(apiGraphController)
export { routes, graphRoutes }
