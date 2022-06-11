import { PaginationFilters } from './pagination'

export interface Phase {
  id: string
  name: string
  done: boolean
  createdOn: Date
  updatedOn: Date
}

export type PhaseCreation = Pick<Phase, 'name'>

export type PhaseEdition = Partial<Pick<Phase, 'name' | 'done'>>

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

export type PaginatedPhasesFilters = PhasesFilters & PaginationFilters
