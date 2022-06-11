import { TasksService } from '../../../service/tasks/tasksService'
import { TasksRepository } from '../../../repository/tasksRepository'

export function tasksServiceMock(args: Record<string, unknown>): TasksService {
  return <TasksService>{
    tasksRepository: args.tasksRepository,
    logger: args.logger,
    createTask: args.createTask,
    getTasks: args.getTasks,
  }
}

export function tasksRepositoryMock(
  args: Record<string, unknown>
): TasksRepository {
  return <TasksRepository>{
    pgClient: args.pgClient,
    logger: args.logger,
    insertTask: args.insertTask,
    getTasks: args.getTasks,
  }
}
