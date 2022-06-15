import { ServerHealth } from '../service/server/serverHealth'
import { dbClient } from './postgresqlInjections'

const serverHealth = new ServerHealth(dbClient)

export { serverHealth }
