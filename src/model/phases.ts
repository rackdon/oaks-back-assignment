import { PaginationFilters } from './pagination'
import { Task } from './tasks'

export interface PhaseRaw {
  id: string
  name: string
  done: boolean
  createdOn: Date
  updatedOn: Date
}

export type PhaseWithTasks = PhaseRaw & { tasks: Omit<Task, 'phaseId'>[] }

export type Phase = PhaseRaw | PhaseWithTasks

export type PhaseCreation = Pick<PhaseRaw, 'name'>

export type PhaseEdition = Partial<Pick<PhaseRaw, 'name' | 'done'>>

export interface PhasesFilters {
  name?: string
  done?: boolean
  createdBefore?: Date
  createdAfter?: Date
}

export function toPhasesFilters({
  name,
  done,
  createdBefore,
  createdAfter,
}: PaginatedPhasesFilters): PhasesFilters {
  return {
    name,
    done,
    createdBefore,
    createdAfter,
  }
}

export type PhaseProjection = 'PhaseRaw' | 'PhaseWithTasks'

export type PaginatedPhasesFilters = PhasesFilters &
  PaginationFilters & { projection?: PhaseProjection }
