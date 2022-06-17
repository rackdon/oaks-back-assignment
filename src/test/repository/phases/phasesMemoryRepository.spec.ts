import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { MemoryClient } from '../../../client/database/memoryClient'
import { LoggerConfig } from '../../../configuration/loggerConfig'
import { PhasesMemoryRepository } from '../../../repository/phases/phasesMemoryRepository'
import { expectLeft, expectRight } from '../../utils/expects'
import { Conflict } from '../../../model/error'
import { randomUUID } from 'crypto'
import { generateTask } from '../../utils/generators/tasksGenerator'
import { Pagination } from '../../../model/pagination'

describe('Insert phase', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns created phase', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phaseCreation = generatePhaseCreation()
    const result = await phasesRepository.insertPhase(phaseCreation)
    expectRight(result, (x) => {
      return { name: x.name, done: x.done }
    }).toEqual({ name: phaseCreation.name, done: false })
    expect(memoryClient.getPhases()).toEqual([result.extract()])
  })

  it('Returns conflict when phase name already exists', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phaseCreation = generatePhaseCreation()
    await phasesRepository.insertPhase(phaseCreation)
    const result = await phasesRepository.insertPhase(phaseCreation)
    expectLeft(result, (x) => x.constructor).toEqual(Conflict)
  })
})

describe('Update phase', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns updated phase', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    memoryClient.getPhases().push(phase)
    const phaseEdition = { name: 'a', done: true }
    const result = await phasesRepository.updatePhase(phase.id, phaseEdition)
    expectRight(result).toEqual({
      ...phase,
      name: phaseEdition.name,
      done: phaseEdition.done,
    })
    expect(memoryClient.getPhases()).toEqual([result.extract()])
  })

  it('Returns null if phase does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phaseEdition = { name: 'a', done: true }
    const result = await phasesRepository.updatePhase(
      randomUUID(),
      phaseEdition
    )
    expectRight(result).toEqual(null)
    expect(memoryClient.getPhases()).toEqual([])
  })
})

describe('Get phases', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns  paginated phases', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase1 = generatePhase()
    const phase2 = generatePhase()
    const phase3 = generatePhase()
    const pagination = {
      page: 1,
      pageSize: 1,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getPhases().push(phase1, phase2, phase3)
    const result = await phasesRepository.getPhases('PhaseRaw', {}, pagination)
    expectRight(result).toEqual({ data: [phase2], pages: 3 })
  })

  it('Returns  phases sorted by name with asc sortDir', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase1 = generatePhase(undefined, 'b')
    const phase2 = generatePhase(undefined, 'c')
    const phase3 = generatePhase(undefined, 'a')
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['name'],
      sortDir: 'ASC',
    }
    memoryClient.getPhases().push(phase1, phase2, phase3)
    const result = await phasesRepository.getPhases('PhaseRaw', {}, pagination)
    expectRight(result).toEqual({ data: [phase3, phase1, phase2], pages: 1 })
  })

  it('Returns  phases filtered by createdBefore and done', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const date1 = new Date()
    const date2 = new Date(date1.getTime() + 1000)
    const date3 = new Date(date2.getTime() + 1000)
    const phase1 = generatePhase(undefined, 'b', false, date1)
    const phase2 = generatePhase(undefined, 'c', true, date2)
    const phase3 = generatePhase(undefined, 'a', true, date3)
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getPhases().push(phase1, phase2, phase3)
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      { done: true, createdBefore: phase3.createdOn },
      pagination
    )
    expectRight(result).toEqual({ data: [phase2], pages: 1 })
  })

  it('Returns  phases filtered by createdAfter', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const date1 = new Date()
    const date2 = new Date(date1.getTime() + 1000)
    const date3 = new Date(date2.getTime() + 1000)
    const phase1 = generatePhase(undefined, 'b', false, date1)
    const phase2 = generatePhase(undefined, 'c', true, date2)
    const phase3 = generatePhase(undefined, 'a', true, date3)
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['createdOn'],
      sortDir: null,
    }
    memoryClient.getPhases().push(phase1, phase2, phase3)
    const result = await phasesRepository.getPhases(
      'PhaseRaw',
      { createdAfter: phase1.createdOn },
      pagination
    )
    expectRight(result).toEqual({ data: [phase3, phase2], pages: 1 })
  })

  it('Returns  phases filtered by name and PhaseWithTasks projection', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const date1 = new Date()
    const date2 = new Date(date1.getTime() + 1000)
    const date3 = new Date(date2.getTime() + 1000)
    const phase1 = generatePhase(undefined, 'b', false, date1)
    const phase2 = generatePhase(undefined, 'c', true, date2)
    const phase3 = generatePhase(undefined, 'a', true, date3)
    const task1 = generateTask(undefined, phase1.id)
    const task2 = generateTask(undefined, phase3.id)
    const task3 = generateTask(undefined, phase2.id)
    const task4 = generateTask(undefined, phase1.id)
    const task5 = generateTask(undefined, phase3.id)
    const task6 = generateTask(undefined, phase2.id)
    const pagination: Pagination = {
      page: 0,
      pageSize: 10,
      sort: ['createdOn'],
      sortDir: null,
    }
    const returnedEnrichedPhase = {
      ...phase2,
      tasks: [
        {
          id: task3.id,
          name: task3.name,
          done: task3.done,
          createdOn: task3.createdOn,
          updatedOn: task3.updatedOn,
        },
        {
          id: task6.id,
          name: task6.name,
          done: task6.done,
          createdOn: task6.createdOn,
          updatedOn: task6.updatedOn,
        },
      ],
    }
    memoryClient.getPhases().push(phase1, phase2, phase3)
    memoryClient.getTasks().push(task1, task2, task3, task4, task5, task6)
    const result = await phasesRepository.getPhases(
      'PhaseWithTasks',
      { name: phase2.name },
      pagination
    )
    expectRight(result).toEqual({ data: [returnedEnrichedPhase], pages: 1 })
  })
})

describe('Get phase by id', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns  phase raw if PhaseRaw projection', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    memoryClient.getPhases().push(phase)
    const result = await phasesRepository.getPhaseById(phase.id, 'PhaseRaw')
    expectRight(result).toEqual(phase)
  })

  it('Returns  phase with tasks if PhaseWithTasks projection', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    const task1 = generateTask(undefined, phase.id)
    const task2 = generateTask()
    memoryClient.getPhases().push(phase)
    memoryClient.getTasks().push(task1, task2)
    const result = await phasesRepository.getPhaseById(
      phase.id,
      'PhaseWithTasks'
    )
    expectRight(result).toEqual({
      ...phase,
      tasks: [
        {
          id: task1.id,
          name: task1.name,
          done: task1.done,
          createdOn: task1.createdOn,
          updatedOn: task1.updatedOn,
        },
      ],
    })
  })

  it('Returns null if phase does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    memoryClient.getPhases().push(phase)
    const result = await phasesRepository.getPhaseById(randomUUID(), 'PhaseRaw')
    expectRight(result).toEqual(null)
  })
})

describe('Delete phase by id', () => {
  const loggerConfig = new LoggerConfig().create()
  it('Returns 1 if phase is deleted', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    memoryClient.getPhases().push(phase)
    const result = await phasesRepository.deletePhaseById(phase.id)
    expectRight(result).toEqual(1)
    expect(memoryClient.getPhases()).toEqual([])
  })

  it('Returns 0 if phase does not exist', async () => {
    const memoryClient = new MemoryClient(loggerConfig)
    const phasesRepository = new PhasesMemoryRepository(
      memoryClient,
      loggerConfig
    )
    const phase = generatePhase()
    memoryClient.getPhases().push(phase)
    const result = await phasesRepository.deletePhaseById(randomUUID())
    expectRight(result).toEqual(0)
    expect(memoryClient.getPhases()).toEqual([phase])
  })
})
