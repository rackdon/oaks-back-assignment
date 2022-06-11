import { PhasesRepository } from '../repository/phasesRepository'
import { pgClient } from './postgresqlInjections'
import { loggerConfig } from './configInjections'
import { PhasesService } from '../service/phases/phasesService'
import { PhasesController } from '../controller/phases/phasesController'

const phasesRepository = new PhasesRepository(pgClient, loggerConfig)
const phasesService = new PhasesService(phasesRepository, loggerConfig)
const phasesController = new PhasesController(phasesService, loggerConfig)

export { phasesRepository, phasesService, phasesController }
