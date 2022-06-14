import { ApiGraphController } from '../graphController/apiGraphController'
import { pgClient } from './postgresqlInjections'

const apiGraphController = new ApiGraphController(pgClient)

export { apiGraphController }
