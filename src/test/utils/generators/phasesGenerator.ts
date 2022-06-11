import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'
import { Phase, PhaseCreation } from '../../../model/phases'
import { STRING_LIMIT } from './constants'

export function generatePhaseCreation(name?: string): PhaseCreation {
  return {
    name: name || faker.random.alpha(STRING_LIMIT),
  }
}

export function generatePhase(
  id?: string,
  name?: string,
  done?: boolean,
  createdOn?: Date,
  updatedOn?: Date
): Phase {
  return {
    id: id || randomUUID({}),
    name: name || faker.random.alpha(STRING_LIMIT),
    done: done !== undefined ? done : Math.random() < 0.5,
    createdOn: createdOn || new Date(),
    updatedOn: updatedOn || new Date(),
  }
}
