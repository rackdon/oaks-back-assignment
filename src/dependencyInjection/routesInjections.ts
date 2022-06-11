import { phasesController } from './phasesInjections'
import { Routes } from '../routes/routes'

const routes = new Routes(phasesController)
export { routes }
