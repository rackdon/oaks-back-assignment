import { ApiError } from '../model/error'
import { Either } from '../model/either'
import { DataWithPages, Pagination } from '../model/pagination'
import { Sequelize } from 'sequelize'
import { Task, TaskCreation, TaskEdition, TasksFilters } from '../model/tasks'
import { Logger } from '../service/server/logger'

export interface TasksRepository {
  logger: Logger
  dbClient: Sequelize
  insertTask(taskCreation: TaskCreation): Promise<Either<ApiError, Task>>
  updateTask(
    id: string,
    taskEdition: TaskEdition
  ): Promise<Either<ApiError, Task | null>>
  getTasks(
    filters: TasksFilters,
    pagination: Pagination
  ): Promise<Either<ApiError, DataWithPages<Task>>>
  getTaskById(id: string): Promise<Either<ApiError, Task | null>>
  deleteTaskById(id: string): Promise<Either<ApiError, number>>
  getGraphTasksResolver()
  getGraphTaskPhaseResolver()
}
