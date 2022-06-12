/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PostgresqlClient } from '../../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { DatabaseCleanerPsql } from '../utils/databaseCleanerPsql'
import { Factory } from '../utils/factory'
import { ApiError, Conflict, Forbidden } from '../../model/error'
import { Either } from '../../model/either'
import { getDatabaseTestConfig } from '../utils/databaseTestConfig'
import { PhasesRepository } from '../../repository/phasesRepository'
import { Phase, PhaseRaw, PhaseWithTasks } from '../../model/phases'
import { expectLeft, expectRight } from '../../test/utils/expects'
import { generatePhase } from '../../test/utils/generators/phasesGenerator'
import { generatePagination } from '../../test/utils/generators/paginationGenerator'
import { Task } from '../../model/tasks'
import { generateTask } from '../../test/utils/generators/tasksGenerator'
import { randomUUID } from 'crypto'

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

  it('insertPhase returns conflict', async () => {
    const name = 'name'
    await factory.insertPhase(generatePhase(undefined, name))
    const result = await phasesRepository.insertPhase({ name })
    expectLeft(result).toEqual(new Conflict(['name must be unique']))
  })

  it('updatePhase returns phase with updated data', async () => {
    const name1 = 'name'
    const name2 = 'name2'
    const phase = await factory.insertPhase(
      generatePhase(undefined, name1, false)
    )
    const result = await phasesRepository.updatePhase(phase.id, {
      name: name2,
      done: true,
    })
    expectRight(result, (x) => {
      return { name: x.name, done: x.done }
    }).toEqual({ name: name2, done: true })
  })

  it('updatePhase returns null if phase does not exists', async () => {
    const name2 = 'name2'
    const result = await phasesRepository.updatePhase(randomUUID(), {
      name: name2,
      done: true,
    })
    expectLeft(result).toEqual(null)
    expectRight(result).toEqual(null)
  })

  it('getPhases returns all phases with PhaseRaw projection', async () => {
    const firstDate = new Date()
    const secondDate = new Date(firstDate.getTime() + 3600000)
    const phase1: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'a', true, firstDate)
    )
    const phase2: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'b', false, secondDate)
    )
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      {},
      generatePagination()
    )
    expectRight(result).toEqual({ data: [phase1, phase2], pages: 1 })
  })

  it('getPhases returns all phases that match name query', async () => {
    const firstDate = new Date()
    const secondDate = new Date(firstDate.getTime() + 3600000)
    const phase1: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'a', true, firstDate)
    )
    const phase2: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'b', false, secondDate)
    )
    const task: Omit<Task, 'phaseId'> = await factory.insertTask(
      phase2.id,
      generateTask(undefined, phase2.id, 'a', true)
    )
    delete task['phaseId']
    const resultData: PhaseWithTasks = { ...phase2, tasks: [task] }
    const result = await phasesRepository.getPhases(
      'PhaseWithTasks',
      { name: phase2.name },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [resultData], pages: 1 })
  })

  it('getPhases returns all phases that match done query', async () => {
    const firstDate = new Date()
    const secondDate = new Date(firstDate.getTime() + 3600000)
    const phase1: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'a', true, firstDate)
    )
    const phase2: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'b', false, secondDate)
    )
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      { done: false },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [phase2], pages: 1 })
  })

  it('getPhases returns all phases that match createdBefore query', async () => {
    const firstDate = new Date()
    const secondDate = new Date(firstDate.getTime() + 7500000)
    const queryDate = new Date(secondDate.getTime() + 1000)
    const phase1: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'a', true, firstDate)
    )
    const phase2: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'b', false, secondDate)
    )
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      { createdBefore: queryDate },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [phase1], pages: 1 })
  })

  it('getPhases returns all phases that match createdAfter query', async () => {
    const firstDate = new Date()
    const secondDate = new Date(firstDate.getTime() + 7500000)
    const queryDate = new Date(secondDate.getTime() - 1000)
    const phase1: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'a', true, firstDate)
    )
    const phase2: PhaseRaw = await factory.insertPhase(
      generatePhase(undefined, 'b', false, secondDate)
    )
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      { createdAfter: secondDate },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [phase2], pages: 1 })
  })

  it('get phase by id returns the phase with raw projection', async () => {
    const phase: Phase = await factory.insertPhase()
    const result = await phasesRepository.getPhaseById(phase.id, 'PhaseRaw')
    expectRight(result).toEqual(phase)
  })

  it('get phase by id returns the phase with phase with tasks projection', async () => {
    const phase: Phase = await factory.insertPhase()
    const task: Omit<Task, 'phaseId'> = await factory.insertTask(
      phase.id,
      generateTask(undefined, phase.id)
    )
    delete task['phaseId']
    const result = await phasesRepository.getPhaseById(
      phase.id,
      'PhaseWithTasks'
    )
    expectRight(result).toEqual({ ...phase, tasks: [task] })
  })

  it('get task by id returns null if the task does not exist', async () => {
    const result = await phasesRepository.getPhaseById(randomUUID(), 'PhaseRaw')
    expectRight(result).toEqual(null)
  })

  it('Delete phase by id returns 1 when phase is deleted', async () => {
    const phase: PhaseRaw = await factory.insertPhase()
    const result = await phasesRepository.deletePhaseById(phase.id)

    expectRight(result).toEqual(1)
  })

  it('Delete phase by id returns 0 when phase does not exists', async () => {
    const result = await phasesRepository.deletePhaseById(randomUUID())

    expectRight(result).toEqual(0)
  })

  it('Delete phase by id returns error when task are owned by this phase', async () => {
    const phase1: PhaseRaw = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const result = await phasesRepository.deletePhaseById(phase1.id)

    expectLeft(result, (x) => x.constructor).toEqual(Forbidden)
  })
})
