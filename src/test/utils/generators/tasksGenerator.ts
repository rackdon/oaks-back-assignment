import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'
import { STRING_LIMIT } from './constants'
import { Task, TaskCreation, TaskEdition } from '../../../model/tasks'

export function generateTaskCreation(
  name?: string,
  phaseId?: string
): TaskCreation {
  return {
    name: name || faker.random.alpha(STRING_LIMIT),
    phaseId: phaseId || faker.random.alpha(STRING_LIMIT),
  }
}

export function generateTaskEdition(
  name?: string,
  done?: boolean
): TaskEdition {
  return {
    name: name || faker.random.alpha(STRING_LIMIT),
    done: done !== undefined ? done : Math.random() < 0.5,
  }
}

export function generateTask(
  id?: string,
  phaseId?: string,
  name?: string,
  done?: boolean,
  createdOn?: Date,
  updatedOn?: Date
): Task {
  return {
    id: id || randomUUID({}),
    phaseId: phaseId || faker.random.alpha(STRING_LIMIT),
    name: name || faker.random.alpha(STRING_LIMIT),
    done: done !== undefined ? done : Math.random() < 0.5,
    createdOn: createdOn || new Date(),
    updatedOn: updatedOn || new Date(),
  }
}
