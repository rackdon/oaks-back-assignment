/* eslint-disable  @typescript-eslint/no-unused-vars */

import { PostgresqlClient } from '../../client/database/postgresqlClient'
import { LoggerConfig } from '../../configuration/loggerConfig'
import { DatabaseCleanerPsql } from '../utils/databaseCleanerPsql'
import { Factory } from '../utils/factory'
import { ApiError, BadRequest } from '../../model/error'
import { Either } from '../../model/either'
import { getDatabaseTestConfig } from '../utils/databaseTestConfig'
import { Phase } from '../../model/phases'
import { expectLeft, expectRight } from '../../test/utils/expects'
import { generatePagination } from '../../test/utils/generators/paginationGenerator'
import { TasksDbRepository } from '../../repository/tasksDbRepository'
import { randomUUID } from 'crypto'
import { Task } from '../../model/tasks'
import { generateTask } from '../../test/utils/generators/tasksGenerator'

describe('tasksRepository', () => {
  const dbConfig = getDatabaseTestConfig()
  const loggerConfig = new LoggerConfig()
  let postgresqlClient: PostgresqlClient
  let dbCleaner
  let factory: Factory
  let tasksRepository: TasksDbRepository
  beforeAll(async () => {
    postgresqlClient = await PostgresqlClient.CreateAsync(
      dbConfig,
      loggerConfig
    )
    dbCleaner = new DatabaseCleanerPsql(postgresqlClient.client)
    factory = new Factory(postgresqlClient.client)
    tasksRepository = new TasksDbRepository(postgresqlClient, loggerConfig)
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

  it('updateTask returns task with updated data', async () => {
    const name1 = 'name'
    const name2 = 'name2'
    const phase = await factory.insertPhase()
    const task = await factory.insertTask(
      phase.id,
      generateTask(undefined, phase.id, name1, false)
    )
    const result = await tasksRepository.updateTask(task.id, {
      name: name2,
      done: true,
    })
    expectRight(result, (x) => {
      return { name: x.name, done: x.done }
    }).toEqual({ name: name2, done: true })
  })

  it('updatePhase returns null if phase does not exists', async () => {
    const name2 = 'name2'
    const result = await tasksRepository.updateTask(randomUUID(), {
      name: name2,
      done: true,
    })
    expectLeft(result).toEqual(null)
    expectRight(result).toEqual(null)
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

  it('get task by id returns the task', async () => {
    const phase: Phase = await factory.insertPhase()
    const task: Task = await factory.insertTask(
      phase.id,
      generateTask(undefined, phase.id)
    )
    const result = await tasksRepository.getTaskById(task.id)
    expectRight(result).toEqual(task)
  })

  it('get task by id returns null if the task does not exist', async () => {
    const result = await tasksRepository.getTaskById(randomUUID())
    expectRight(result).toEqual(null)
  })

  it('Delete task by id returns 1 when task is deleted', async () => {
    const phase1: Phase = await factory.insertPhase()
    const task1: Task = await factory.insertTask(
      phase1.id,
      generateTask(undefined, phase1.id, 'a', true)
    )
    const result = await tasksRepository.deleteTaskById(task1.id)

    expectRight(result).toEqual(1)
  })

  it('Delete task by id returns 0 when task does not exists', async () => {
    const result = await tasksRepository.deleteTaskById(randomUUID())

    expectRight(result).toEqual(0)
  })
})
