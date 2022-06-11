import { HealthCheckError } from '@godaddy/terminus'
import { PostgresqlClient } from '../../client/postgresql/postgresqlClient'

export class ServerHealth {
  readonly pgClient: PostgresqlClient

  constructor(pgClient: PostgresqlClient) {
    this.pgClient = pgClient
  }

  onHealthCheck = async (): Promise<Record<string, string>> => {
    let statusOk = true
    const statusDetails = {}
    if (this.pgClient.isClosed()) {
      statusOk = false
      statusDetails['postgres'] = 'KO'
    } else {
      statusDetails['postgres'] = 'OK'
    }
    if (statusOk) {
      return statusDetails
    } else {
      throw new HealthCheckError('Error', statusDetails)
    }
  }

  onShutdown = async (): Promise<Awaited<void>[]> => {
    return Promise.all([this.pgClient.closeConnection()])
  }
}
