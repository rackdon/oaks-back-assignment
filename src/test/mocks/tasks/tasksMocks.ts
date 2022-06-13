import { TasksService } from '../../../service/tasks/tasksService'
import { TasksRepository } from '../../../repository/tasksRepository'

export function tasksServiceMock(args: Record<string, unknown>): TasksService {
  return <TasksService>{
    tasksRepository: args.tasksRepository,
    phasesRepository: args.phasesRepository,
    logger: args.logger,
    createTask: args.createTask,
    editTask: args.editTask,
    getTasks: args.getTasks,
    deleteTaskById: args.deleteTaskById,
    getTaskById: args.getTaskById,
  }
}

export function tasksRepositoryMock(
  args: Record<string, unknown>
): TasksRepository {
  return <TasksRepository>{
    pgClient: args.pgClient,
    logger: args.logger,
    insertTask: args.insertTask,
    updateTask: args.updateTask,
    getTasks: args.getTasks,
    deleteTaskById: args.deleteTaskById,
    getTaskById: args.getTaskById,
  }
}
