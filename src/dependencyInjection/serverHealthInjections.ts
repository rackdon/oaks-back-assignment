import { ServerHealth } from '../service/server/serverHealth'
import { pgClient } from './postgresqlInjections'

const serverHealth = new ServerHealth(pgClient)

export { serverHealth }
