import { MemoryClient } from '../../../client/database/memoryClient'
import { LoggerConfig } from '../../../configuration/loggerConfig'
import { expectRight } from '../../utils/expects'
import { randomUUID } from 'crypto'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksMemoryRepository } from '../../../repository/tasks/tasksMemoryRepository'

describe('Insert task', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns created task', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const taskCreation = generateTaskCreation()
    const result = await tasksRepository.insertTask(taskCreation)
    expectRight(result, (x) => {
      return { name: x.name, done: x.done }
    }).toEqual({ name: taskCreation.name, done: false })
    expect(memoryClient.getTasks()).toEqual([result.extract()])
  })
})

describe('Update task', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns updated task', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task = generateTask()
    memoryClient.getTasks().push(task)
    const taskEdition = { name: 'a', done: true }
    const result = await tasksRepository.updateTask(task.id, taskEdition)
    expectRight(result).toEqual({
      ...task,
      name: taskEdition.name,
      done: taskEdition.done,
    })
    expect(memoryClient.getTasks()).toEqual([result.extract()])
  })

  it('Returns null if task does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const taskEdition = { name: 'a', done: true }
    const result = await tasksRepository.updateTask(randomUUID(), taskEdition)
    expectRight(result).toEqual(null)
    expect(memoryClient.getTasks()).toEqual([])
  })
})

describe('Get task by id', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns  task', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task = generateTask()
    memoryClient.getTasks().push(task)
    const result = await tasksRepository.getTaskById(task.id)
    expectRight(result).toEqual(task)
  })

  it('Returns null if task does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task = generateTask()
    memoryClient.getTasks().push(task)
    const result = await tasksRepository.getTaskById(randomUUID())
    expectRight(result).toEqual(null)
  })
})

describe('Delete task by id', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns 1 if task is deleted', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task = generateTask()
    memoryClient.getTasks().push(task)
    const result = await tasksRepository.deleteTaskById(task.id)
    expectRight(result).toEqual(1)
    expect(memoryClient.getTasks()).toEqual([])
  })

  it('Returns 0 if task does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task = generateTask()
    memoryClient.getTasks().push(task)
    const result = await tasksRepository.deleteTaskById(randomUUID())
    expectRight(result).toEqual(0)
    expect(memoryClient.getTasks()).toEqual([task])
  })
})
