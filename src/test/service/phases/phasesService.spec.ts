/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { EitherI } from '../../../model/either'
import { expectRight } from '../../utils/expects'
import { Phase, PhaseCreation } from '../../../model/phases'
import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { PhasesRepository } from '../../../repository/phasesRepository'
import { phasesRepositoryMock } from '../../mocks/phases/phasesMocks'
import { PhasesService } from '../../../service/phases/phasesService'

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
