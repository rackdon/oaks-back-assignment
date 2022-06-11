/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectLeft, expectRight } from '../../utils/expects'
import { Task, TaskCreation } from '../../../model/tasks'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksRepository } from '../../../repository/tasksRepository'
import { tasksRepositoryMock } from '../../mocks/tasks/tasksMocks'
import { TasksService } from '../../../service/tasks/tasksService'
import { Phase, PhasesFilters } from '../../../model/phases'
import { generatePhase } from '../../utils/generators/phasesGenerator'
import { DataWithPages, Pagination } from '../../../model/pagination'
import { PhasesRepository } from '../../../repository/phasesRepository'
import { phasesRepositoryMock } from '../../mocks/phases/phasesMocks'
import { PhasesService } from '../../../service/phases/phasesService'
import { NotFound } from '../../../model/error'

describe('Create task', () => {
  it('returns repository response', async () => {
    const taskCreation: TaskCreation = generateTaskCreation()
    const task: Task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      insertTask: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(tasksRepository, loggerConfig)
    const result = await service.createTask(taskCreation)

    expectRight(result).toEqual(task)
    expect(tasksRepository.insertTask).toBeCalledWith(taskCreation)
  })
})

describe('Get tasks', () => {
  it('returns repository response', async () => {
    const taskData: Task = generateTask()
    const response: DataWithPages<Task> = { data: [taskData], pages: 1 }
    const filters = { name: 'name', pageSize: 5 }
    const tasksFilters: PhasesFilters = { name: filters.name }
    const paginationFilters: Pagination = {
      pageSize: filters.pageSize,
      page: 0,
      sort: [],
      sortDir: null,
    }
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTasks: jest.fn().mockImplementation(() => {
        return EitherI.Right(response)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(tasksRepository, loggerConfig)
    const result = await service.getTasks(filters)

    expectRight(result).toEqual(response)
    expect(tasksRepository.getTasks).toBeCalledWith(
      tasksFilters,
      paginationFilters
    )
  })
})

describe('Get task by id', () => {
  it('returns task if exists', async () => {
    const task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(tasksRepository, loggerConfig)
    const result = await service.getTaskById(task.id)

    expectRight(result).toEqual(task)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
  })
  it('returns not found if task does not exist', async () => {
    const id = 'id'
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(tasksRepository, loggerConfig)
    const result = await service.getTaskById(id)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(tasksRepository.getTaskById).toBeCalledWith(id)
  })
})

describe('Delete task by id', () => {
  it('returns repository response', async () => {
    const id = 'id'
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      deleteTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(1)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(tasksRepository, loggerConfig)
    const result = await service.deleteTaskById(id)

    expectRight(result).toEqual(1)
    expect(tasksRepository.deleteTaskById).toBeCalledWith(id)
  })
})
