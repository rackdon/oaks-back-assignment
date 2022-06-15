import { HealthCheckError } from '@godaddy/terminus'
import { DatabaseClient } from '../../client/database/databaseClient'

export class ServerHealth {
  readonly dbClient: DatabaseClient

  constructor(dbClient: DatabaseClient) {
    this.dbClient = dbClient
  }

  onHealthCheck = async (): Promise<Record<string, string>> => {
    let statusOk = true
    const statusDetails = {}
    if (this.dbClient.isClosed()) {
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
    return Promise.all([this.dbClient.closeConnection()])
  }
}
