import { PaginationFilters } from './pagination'

export interface Task {
  id: string
  phaseId: string
  name: string
  done: boolean
  createdOn: Date
  updatedOn: Date
}

export type TaskCreation = Pick<Task, 'name' | 'phaseId'>
export type TaskEdition = Partial<Pick<Task, 'name' | 'done'>>

export interface TasksFilters {
  name?: string
  done?: boolean
  phaseId?: string
}

export function toTasksFilters({
  name,
  done,
  phaseId,
}: PaginatedTasksFilters): TasksFilters {
  return {
    name,
    done,
    phaseId,
  }
}

export type PaginatedTasksFilters = TasksFilters & PaginationFilters
