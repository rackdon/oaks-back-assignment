/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectRight } from '../../utils/expects'
import { Phase, PhaseCreation, PhasesFilters } from '../../../model/phases'
import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { PhasesRepository } from '../../../repository/phasesRepository'
import { phasesRepositoryMock } from '../../mocks/phases/phasesMocks'
import { PhasesService } from '../../../service/phases/phasesService'
import { DataWithPages, Pagination } from '../../../model/pagination'

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
      phasesFilters,
      paginationFilters
    )
  })
})
