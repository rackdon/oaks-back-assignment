/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectLeft, expectRight } from '../../utils/expects'
import { Task, TaskCreation, TaskEdition } from '../../../model/tasks'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksRepository } from '../../../repository/tasksRepository'
import { tasksRepositoryMock } from '../../mocks/tasks/tasksMocks'
import { TasksService } from '../../../service/tasks/tasksService'
import { Phase, PhasesFilters } from '../../../model/phases'
import { DataWithPages, Pagination } from '../../../model/pagination'
import { BadRequest, Internal, NotFound } from '../../../model/error'
import { PhasesRepository } from '../../../repository/phasesRepository'
import { phasesRepositoryMock } from '../../mocks/phases/phasesMocks'
import { generatePhase } from '../../utils/generators/phasesGenerator'

describe('Create task', () => {
  it('creates the task correctly', async () => {
    const taskCreation: TaskCreation = generateTaskCreation()
    const phase: Phase = generatePhase()
    const task: Task = generateTask()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(phase)
      }),
    })
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      insertTask: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.createTask(taskCreation)

    expectRight(result).toEqual(task)
    expect(tasksRepository.insertTask).toBeCalledWith(taskCreation)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      taskCreation.phaseId,
      'PhaseRaw'
    )
  })

  it('returns bad request if phase does not exist', async () => {
    const taskCreation: TaskCreation = generateTaskCreation()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const tasksRepository: TasksRepository = tasksRepositoryMock({})
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.createTask(taskCreation)

    expectLeft(result, (x) => x.constructor).toEqual(BadRequest)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      taskCreation.phaseId,
      'PhaseRaw'
    )
  })

  it('returns bad request if phase is already done', async () => {
    const taskCreation: TaskCreation = generateTaskCreation()
    const phase = generatePhase(undefined, undefined, true)
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const tasksRepository: TasksRepository = tasksRepositoryMock({})
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.createTask(taskCreation)

    expectLeft(result, (x) => x.constructor).toEqual(BadRequest)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      taskCreation.phaseId,
      'PhaseRaw'
    )
  })
})

describe('Edit task', () => {
  const phasesRepository: PhasesRepository = phasesRepositoryMock({})
  const loggerConfig = new LoggerConfig()
  it('updates the task directly if done is no present and return updated task', async () => {
    const taskEdition: TaskEdition = { name: 'asdf' }
    const task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
      updateTask: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.editTask(task.id, taskEdition)

    expectRight(result).toEqual(task)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
    expect(tasksRepository.updateTask).toBeCalledWith(task.id, taskEdition)
  })

  it('try to update the task directly if done is no present and return not found if task does not exist', async () => {
    const taskEdition: TaskEdition = { name: 'asdf' }
    const task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.editTask(task.id, taskEdition)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
  })

  it('try to update the task if done is present and return not found if task does not exist', async () => {
    const taskEdition: TaskEdition = { done: true }
    const task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.editTask(task.id, taskEdition)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
  })

  it('try to update the task if done is present and return bad request if previous phases are undone', async () => {
    const taskEdition: TaskEdition = { done: true }
    const task = generateTask()
    const taskPhase = generatePhase()
    const phase = generatePhase(undefined, undefined, false)
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(taskPhase)
      }),
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Right({ data: [phase] })
      }),
    })
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.editTask(task.id, taskEdition)

    expectLeft(result, (x) => x.constructor).toEqual(BadRequest)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      task.phaseId,
      'PhaseRaw'
    )
    expect(phasesRepository.getPhases).toBeCalledWith(
      'PhaseRaw',
      { createdBefore: taskPhase.createdOn },
      { page: 0, pageSize: 10, sort: ['createdOn'], sortDir: null }
    )
  })

  it('try to update the task if done is present and update the task correctly', async () => {
    const taskEdition: TaskEdition = { done: true }
    const task = generateTask()
    const taskPhase = generatePhase()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
      updateTask: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(taskPhase)
      }),
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Right({ data: [] })
      }),
    })
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.editTask(task.id, taskEdition)

    expectRight(result).toEqual(task)
    expect(tasksRepository.getTaskById).toBeCalledWith(task.id)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      task.phaseId,
      'PhaseRaw'
    )
    expect(phasesRepository.getPhases).toBeCalledWith(
      'PhaseRaw',
      { createdBefore: taskPhase.createdOn },
      { page: 0, pageSize: 10, sort: ['createdOn'], sortDir: null }
    )
    expect(tasksRepository.updateTask).toBeCalledWith(task.id, taskEdition)
  })
})

describe('Get tasks', () => {
  const phasesRepository: PhasesRepository = phasesRepositoryMock({})
  it('returns repository response', async () => {
    const taskData: Task = generateTask()
    const response: DataWithPages<Task> = { data: [taskData], pages: 1 }
    const filters = { name: 'name', pageSize: 5 }
    const tasksFilters: PhasesFilters = { name: filters.name }
    const paginationFilters: Pagination = {
      pageSize: filters.pageSize,
      page: 0,
      sort: ['createdOn'],
      sortDir: null,
    }
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTasks: jest.fn().mockImplementation(() => {
        return EitherI.Right(response)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.getTasks(filters)

    expectRight(result).toEqual(response)
    expect(tasksRepository.getTasks).toBeCalledWith(
      tasksFilters,
      paginationFilters
    )
  })
})

describe('Get task by id', () => {
  const phasesRepository: PhasesRepository = phasesRepositoryMock({})
  it('returns task if exists', async () => {
    const task = generateTask()
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(task)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
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
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.getTaskById(id)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(tasksRepository.getTaskById).toBeCalledWith(id)
  })

  it('returns left if present', async () => {
    const id = 'id'
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      getTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.getTaskById(id)

    expectLeft(result, (x) => x.constructor).toEqual(Internal)
    expect(tasksRepository.getTaskById).toBeCalledWith(id)
  })
})

describe('Delete task by id', () => {
  const phasesRepository: PhasesRepository = phasesRepositoryMock({})
  it('returns repository response', async () => {
    const id = 'id'
    const tasksRepository: TasksRepository = tasksRepositoryMock({
      deleteTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(1)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new TasksService(
      tasksRepository,
      phasesRepository,
      loggerConfig
    )
    const result = await service.deleteTaskById(id)

    expectRight(result).toEqual(1)
    expect(tasksRepository.deleteTaskById).toBeCalledWith(id)
  })
})
