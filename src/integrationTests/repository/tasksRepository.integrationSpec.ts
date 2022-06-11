/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PostgresqlClient } from '../../client/postgresql/postgresqlClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { DatabaseCleanerPsql } from '../utils/databaseCleanerPsql'
import { Factory } from '../utils/factory'
import {
  ApiError,
  BadRequest,
  Conflict,
  Internal,
  NotFound,
} from '../../model/error'
import { Either } from '../../model/either'
import { getDatabaseTestConfig } from '../utils/databaseTestConfig'
import { PhasesRepository } from '../../repository/phasesRepository'
import { Phase } from '../../model/phases'
import { expectLeft, expectRight } from '../../test/utils/expects'
import { generatePhase } from '../../test/utils/generators/phasesGenerator'
import { generatePagination } from '../../test/utils/generators/paginationGenerator'
import { TasksRepository } from '../../repository/tasksRepository'
import { randomUUID } from 'crypto'
import { Task } from '../../model/tasks'
import { generateTask } from '../../test/utils/generators/tasksGenerator'

describe('tasksRepository', () => {
  const dbConfig = getDatabaseTestConfig()
  const loggerConfig = new LoggerConfig()
  let postgresqlClient: PostgresqlClient
  let dbCleaner
  let factory: Factory
  let tasksRepository: TasksRepository
  beforeAll(async () => {
    postgresqlClient = await PostgresqlClient.CreateAsync(
      dbConfig,
      loggerConfig
    )
    dbCleaner = new DatabaseCleanerPsql(postgresqlClient.client)
    factory = new Factory(postgresqlClient.client)
    tasksRepository = new TasksRepository(postgresqlClient, loggerConfig)
  })

  beforeEach(async () => {
    await dbCleaner.truncate()
  })

  afterAll(async () => {
    await postgresqlClient.closeConnection()
  })
  it('insertTask inserts the task in the db and returns it', async () => {
    const phase = await factory.insertPhase()
    const name = 'name'
    const result: Either<ApiError, Phase> = await tasksRepository.insertTask({
      name,
      phaseId: phase.id,
    })
    expectRight(result, (x) => {
      return { name: x.name, done: x.done, phaseId: phase.id }
    }).toEqual({ name, done: false, phaseId: phase.id })
  })

  it('insertTask returns bad request if phase does not exists', async () => {
    const name = 'name'
    const result: Either<ApiError, Phase> = await tasksRepository.insertTask({
      name,
      phaseId: randomUUID(),
    })
    expectLeft(result).toEqual(
      new BadRequest([
        'insert or update on table "tasks" violates foreign key constraint "tasks_phase_id_fkey"',
      ])
    )
  })

  it('getTasks returns all tasks', async () => {
    const phase1: Phase = await factory.insertPhase()
    const phase2: Phase = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const task2: Task = await factory.insertTask(
      phase2.id,
      generateTask(undefined, phase2.id, 'b', false)
    )
    const result = await tasksRepository.getTasks({}, generatePagination())
    expectRight(result).toEqual({ data: [task1, task2], pages: 1 })
  })

  it('getTasks returns all tasks that match name query', async () => {
    const phase1: Phase = await factory.insertPhase()
    const phase2: Phase = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const task2: Task = await factory.insertTask(
      phase2.id,
      generateTask(undefined, phase2.id, 'b', false)
    )
    const result = await tasksRepository.getTasks(
      { name: 'a' },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [task1], pages: 1 })
  })

  it('getTasks returns all tasks that match done query', async () => {
    const phase1: Phase = await factory.insertPhase()
    const phase2: Phase = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const task2: Task = await factory.insertTask(
      phase2.id,
      generateTask(undefined, phase2.id, 'b', false)
    )
    const result = await tasksRepository.getTasks(
      { done: false },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [task2], pages: 1 })
  })

  it('getTasks returns all tasks that match phase id query', async () => {
    const phase1: Phase = await factory.insertPhase()
    const phase2: Phase = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const task2: Task = await factory.insertTask(
      phase2.id,
      generateTask(undefined, phase2.id, 'b', false)
    )
    const result = await tasksRepository.getTasks(
      { phaseId: phase2.id },
      generatePagination()
    )
    expectRight(result).toEqual({ data: [task2], pages: 1 })
  })
})