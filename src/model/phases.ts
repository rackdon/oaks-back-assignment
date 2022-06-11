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

export type PhasesFilters = Partial<Pick<Phase, 'name' | 'done'>>

export function toPhaseFilters({
  name,
  done,
}: PaginatedPhasesFilters): PhasesFilters {
  return {
    name,
    done,
  }
}

export type PaginatedPhasesFilters = PhasesFilters & PaginationFilters
