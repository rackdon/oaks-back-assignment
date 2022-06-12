/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectLeft, expectRight } from '../../utils/expects'
import {
  Phase,
  PhaseCreation,
  PhaseEdition,
  PhaseProjection,
  PhasesFilters,
} from '../../../model/phases'
import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { PhasesRepository } from '../../../repository/phasesRepository'
import { phasesRepositoryMock } from '../../mocks/phases/phasesMocks'
import { PhasesService } from '../../../service/phases/phasesService'
import { DataWithPages, Pagination } from '../../../model/pagination'
import { BadRequest, Internal, NotFound } from '../../../model/error'
import { generateTask } from '../../utils/generators/tasksGenerator'

describe('Create phase', () => {
  it('returns repository response', async () => {
    const phaseCreation: PhaseCreation = generatePhaseCreation()
    const phase: Phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      insertPhase: jest.fn().mockImplementation(() => {
        return EitherI.Right(phase)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.createPhase(phaseCreation)

    expectRight(result).toEqual(phase)
    expect(phasesRepository.insertPhase).toBeCalledWith(phaseCreation)
  })
})

describe('Edit phase', () => {
  it('updates the phase directly if done is no present and return updated phase', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf' }
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      updatePhase: jest.fn().mockImplementation(() => {
        return EitherI.Right(phase)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectRight(result).toEqual(phase)
    expect(phasesRepository.updatePhase).toBeCalledWith(phase.id, phaseEdition)
  })

  it('try to update the phase directly if done is no present and return not found if phase does not exist', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf' }
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      updatePhase: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(phasesRepository.updatePhase).toBeCalledWith(phase.id, phaseEdition)
  })

  it('try to find the phase and return find error', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf', done: true }
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new NotFound())
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      phase.id,
      'PhaseWithTasks'
    )
  })

  it('checks if all task are done and returns bad request if not', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf', done: true }
    const task = generateTask(undefined, undefined, undefined, false)
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right({ ...generatePhase(), tasks: [task] })
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectLeft(result, (x) => x.constructor).toEqual(BadRequest)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      phase.id,
      'PhaseWithTasks'
    )
  })

  it('checks if all task are done and then try to update phase returning update error', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf', done: true }
    const task = generateTask(undefined, undefined, undefined, true)
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right({ ...generatePhase(), tasks: [task] })
      }),
      updatePhase: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectLeft(result, (x) => x.constructor).toEqual(Internal)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      phase.id,
      'PhaseWithTasks'
    )
    expect(phasesRepository.updatePhase).toBeCalledWith(phase.id, phaseEdition)
  })

  it('checks if all task are done and then update phase and return it', async () => {
    const phaseEdition: PhaseEdition = { name: 'asdf', done: true }
    const task = generateTask(undefined, undefined, undefined, true)
    const phase = generatePhase()
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right({ ...generatePhase(), tasks: [task] })
      }),
      updatePhase: jest.fn().mockImplementation(() => {
        return EitherI.Right(phase)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.editPhase(phase.id, phaseEdition)

    expectRight(result).toEqual(phase)
    expect(phasesRepository.getPhaseById).toBeCalledWith(
      phase.id,
      'PhaseWithTasks'
    )
    expect(phasesRepository.updatePhase).toBeCalledWith(phase.id, phaseEdition)
  })
})

describe('Get phases', () => {
  it('returns repository response', async () => {
    const phaseData: Phase = generatePhase()
    const response: DataWithPages<Phase> = { data: [phaseData], pages: 1 }
    const filters = { name: 'name', pageSize: 5 }
    const phasesFilters: PhasesFilters = { name: filters.name }
    const paginationFilters: Pagination = {
      pageSize: filters.pageSize,
      page: 0,
      sort: [],
      sortDir: null,
    }
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Right(response)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.getPhases(filters)

    expectRight(result).toEqual(response)
    expect(phasesRepository.getPhases).toBeCalledWith(
      'PhaseRaw',
      phasesFilters,
      paginationFilters
    )
  })
})

describe('Get phase by id', () => {
  it('returns phase if exists', async () => {
    const phase = generatePhase()
    const projection: PhaseProjection = 'PhaseRaw'
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(phase)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.getPhaseById(phase.id, { projection })

    expectRight(result).toEqual(phase)
    expect(phasesRepository.getPhaseById).toBeCalledWith(phase.id, projection)
  })

  it('returns not found if phase does not exist', async () => {
    const id = 'id'
    const projection: PhaseProjection = 'PhaseRaw'
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(null)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.getPhaseById(id, { projection })

    expectLeft(result, (x) => x.constructor).toEqual(NotFound)
    expect(phasesRepository.getPhaseById).toBeCalledWith(id, projection)
  })

  it('returns left if present', async () => {
    const id = 'id'
    const projection: PhaseProjection = 'PhaseRaw'
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      getPhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.getPhaseById(id, { projection })

    expectLeft(result, (x) => x.constructor).toEqual(Internal)
    expect(phasesRepository.getPhaseById).toBeCalledWith(id, projection)
  })
})

describe('Delete phase by id', () => {
  it('returns repository response', async () => {
    const id = 'id'
    const phasesRepository: PhasesRepository = phasesRepositoryMock({
      deletePhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(1)
      }),
    })
    const loggerConfig = new LoggerConfig()
    const service = new PhasesService(phasesRepository, loggerConfig)
    const result = await service.deletePhaseById(id)

    expectRight(result).toEqual(1)
    expect(phasesRepository.deletePhaseById).toBeCalledWith(id)
  })
})
