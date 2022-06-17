import { MemoryClient } from '../../../client/database/memoryClient'
import { LoggerConfig } from '../../../configuration/loggerConfig'
import { expectRight } from '../../utils/expects'
import { randomUUID } from 'crypto'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksMemoryRepository } from '../../../repository/tasks/tasksMemoryRepository'
import { Pagination } from '../../../model/pagination'

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

describe('Get tasks', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns  paginated tasks', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task1 = generateTask()
    const task2 = generateTask()
    const task3 = generateTask()
    const pagination = {
      page: 1,
      pageSize: 1,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getTasks().push(task1, task2, task3)
    const result = await tasksRepository.getTasks({}, pagination)
    expectRight(result).toEqual({ data: [task2], pages: 3 })
  })

  it('Returns  tasks sorted by name with asc sortDir', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task1 = generateTask(undefined, undefined, 'b')
    const task2 = generateTask(undefined, undefined, 'c')
    const task3 = generateTask(undefined, undefined, 'a')
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['name'],
      sortDir: 'ASC',
    }
    memoryClient.getTasks().push(task1, task2, task3)
    const result = await tasksRepository.getTasks({}, pagination)
    expectRight(result).toEqual({ data: [task3, task1, task2], pages: 1 })
  })

  it('Returns  tasks filtered by phaseId and done', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phaseId = randomUUID()
    const task1 = generateTask(undefined, phaseId, 'b', false)
    const task2 = generateTask(undefined, undefined, 'c', true)
    const task3 = generateTask(undefined, phaseId, 'a', true)
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getTasks().push(task1, task2, task3)
    const result = await tasksRepository.getTasks(
      { done: true, phaseId: phaseId },
      pagination
    )
    expectRight(result).toEqual({ data: [task3], pages: 1 })
  })

  it('Returns  tasks filtered by name', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const tasksRepository = new TasksMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const task1 = generateTask(undefined, undefined, 'b')
    const task2 = generateTask(undefined, undefined, 'c')
    const task3 = generateTask(undefined, undefined, 'a')
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getTasks().push(task1, task2, task3)
    const result = await tasksRepository.getTasks({ name: 'c' }, pagination)
    expectRight(result).toEqual({ data: [task2], pages: 1 })
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
