/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { mockRequest, MockResponse } from '../utils'
import { BadRequest, Conflict, Internal } from '../../../model/error'
import { EitherI } from '../../../model/either'
import { Task, TaskCreation } from '../../../model/tasks'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksService } from '../../../service/tasks/tasksService'
import { tasksServiceMock } from '../../mocks/tasks/tasksMocks'
import { TasksController } from '../../../controller/tasks/tasksController'
import { randomUUID } from 'crypto'

describe('Create task', () => {
  const loggerConfig = new LoggerConfig()
  const taskCreation: TaskCreation = generateTaskCreation()
  it('returns 201 with the task', async () => {
    const createdTask: Task = generateTask()
    const tasksService: TasksService = tasksServiceMock({
      createTask: jest.fn().mockImplementation(() => {
        return EitherI.Right(createdTask)
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new TasksController(tasksService, loggerConfig)

    await controller.createTask(
      mockRequest(null, taskCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(201)
    expect(mockResponse.body).toEqual(createdTask)
    expect(tasksService.createTask).toBeCalledWith(taskCreation)
  })

  it('returns 400 with errors', async () => {
    const tasksService: TasksService = tasksServiceMock({
      createTask: jest.fn().mockImplementation(() => {
        return EitherI.Left(new BadRequest(['error']))
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new TasksController(tasksService, loggerConfig)

    await controller.createTask(
      mockRequest(null, taskCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(400)
    expect(mockResponse.body).toEqual({ errors: ['error'] })
    expect(tasksService.createTask).toBeCalledWith(taskCreation)
  })
  it('returns 500', async () => {
    const tasksService: TasksService = tasksServiceMock({
      createTask: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new TasksController(tasksService, loggerConfig)

    await controller.createTask(
      mockRequest(null, taskCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(500)
    expect(tasksService.createTask).toBeCalledWith(taskCreation)
  })
})

describe('Delete task by id', () => {
  const loggerConfig = new LoggerConfig()
  const taskId = randomUUID()
  it('returns 204', async () => {
    const tasksService: TasksService = tasksServiceMock({
      deleteTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Right(1)
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new TasksController(tasksService, loggerConfig)

    await controller.deleteTaskById(
      mockRequest({ id: taskId }, null, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(204)
    expect(tasksService.deleteTaskById).toBeCalledWith(taskId)
  })

  it('returns 500', async () => {
    const tasksService: TasksService = tasksServiceMock({
      deleteTaskById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new TasksController(tasksService, loggerConfig)

    await controller.deleteTaskById(
      mockRequest({ id: taskId }, null, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(500)
    expect(tasksService.deleteTaskById).toBeCalledWith(taskId)
  })
})
