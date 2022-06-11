/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectRight } from '../../utils/expects'
import { Task, TaskCreation } from '../../../model/tasks'
import {
  generateTask,
  generateTaskCreation,
} from '../../utils/generators/tasksGenerator'
import { TasksRepository } from '../../../repository/tasksRepository'
import { tasksRepositoryMock } from '../../mocks/tasks/tasksMocks'
import { TasksService } from '../../../service/tasks/tasksService'

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
