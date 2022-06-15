import { bool, cleanEnv, num, str } from 'envalid'

interface DbClientConfig {
  DB_MEMORY: boolean
  DB_HOST: string
  DB_PORT: number
  DB_NAME: string
  DB_USERNAME: string
  DB_PASSWORD: string
  DB_LOG: boolean
}
export class PostgresqlConfig {
  readonly dbMemory: boolean
  readonly host: string
  readonly port: number
  readonly name: string
  readonly username: string
  readonly password: string
  readonly log: boolean

  constructor(config?: DbClientConfig) {
    const dbMemory =
      config?.DB_MEMORY ||
      cleanEnv(process.env, {
        DB_MEMORY: bool({ default: true }),
      }).DB_MEMORY
    const finalConfig =
      config ||
      (dbMemory
        ? {
            DB_HOST: 'host',
            DB_PORT: 0,
            DB_NAME: 'name',
            DB_USERNAME: 'username',
            DB_PASSWORD: 'password',
            DB_LOG: false,
          }
        : cleanEnv(process.env, {
            DB_HOST: str(),
            DB_PORT: num(),
            DB_NAME: str(),
            DB_USERNAME: str(),
            DB_PASSWORD: str(),
            DB_LOG: bool({ default: false }),
          }))
    this.dbMemory = dbMemory
    this.host = finalConfig.DB_HOST
    this.port = finalConfig.DB_PORT
    this.name = finalConfig.DB_NAME
    this.username = finalConfig.DB_USERNAME
    this.password = finalConfig.DB_PASSWORD
    this.log = finalConfig.DB_LOG
  }
}
