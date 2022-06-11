/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PostgresqlClient } from '../../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { DatabaseCleanerPsql } from '../utils/databaseCleanerPsql'
import { Factory } from '../utils/factory'
import { ApiError, Conflict, Internal, NotFound } from '../../model/error'
import { Either } from '../../model/either'
import { getDatabaseTestConfig } from '../utils/databaseTestConfig'
import { PhasesRepository } from '../../repository/phasesRepository'
import { Phase } from '../../model/phases'
import { expectLeft, expectRight } from '../../test/utils/expects'
import { generatePhase } from '../../test/utils/generators/phasesGenerator'

describe('phasesRepository', () => {
  const dbConfig = getDatabaseTestConfig()
  const loggerConfig = new LoggerConfig()
  let postgresqlClient: PostgresqlClient
  let dbCleaner
  let factory: Factory
  let phasesRepository: PhasesRepository
  beforeAll(async () => {
    postgresqlClient = await PostgresqlClient.CreateAsync(
      dbConfig,
      loggerConfig
    )
    dbCleaner = new DatabaseCleanerPsql(postgresqlClient.client)
    factory = new Factory(postgresqlClient.client)
    phasesRepository = new PhasesRepository(postgresqlClient, loggerConfig)
  })

  beforeEach(async () => {
    await dbCleaner.truncate()
  })

  afterAll(async () => {
    await postgresqlClient.closeConnection()
  })
  it('insertPhase inserts the phase in the db and returns it', async () => {
    const name = 'name'
    const result: Either<ApiError, Phase> = await phasesRepository.insertPhase({
      name,
    })
    expectRight(result, (x) => {
      return { name: x.name, done: x.done }
    }).toEqual({ name, done: false })
  })

  it('insertUser returns conflict', async () => {
    const name = 'name'
    await factory.insertPhase(generatePhase(undefined, name))
    const result = await phasesRepository.insertPhase({ name })
    expectLeft(result).toEqual(new Conflict(['name must be unique']))
  })
})
