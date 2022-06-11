import { PostgresqlConfig } from '../../configuration/postgresqlConfig'

export function getDatabaseTestConfig(): PostgresqlConfig {
  return new PostgresqlConfig({
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_NAME: 'oaks_test',
    DB_USERNAME: 'owner',
    DB_PASSWORD: 'owner',
    DB_LOG: true,
  })
}