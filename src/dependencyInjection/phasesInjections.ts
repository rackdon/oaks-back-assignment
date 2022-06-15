import { PhasesDbRepository } from '../repository/phasesDbRepository'
import { dbClient } from './postgresqlInjections'
import { loggerConfig } from './configInjections'
import { PhasesService } from '../service/phases/phasesService'
import { PhasesController } from '../controller/phases/phasesController'
import { PostgresqlClient } from '../client/database/postgresqlClient'
import { PhasesMemoryRepository } from '../repository/phasesMemoryRepository'

const phasesRepository =
  dbClient.constructor === PostgresqlClient
    ? new PhasesDbRepository(dbClient, loggerConfig)
    : new PhasesMemoryRepository(dbClient, loggerConfig)
const phasesService = new PhasesService(phasesRepository, loggerConfig)
const phasesController = new PhasesController(phasesService, loggerConfig)

export { phasesRepository, phasesService, phasesController }
