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
