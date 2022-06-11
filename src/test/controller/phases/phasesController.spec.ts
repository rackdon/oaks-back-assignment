/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { mockRequest, MockResponse } from '../utils'
import { Conflict, Internal } from '../../../model/error'
import { EitherI } from '../../../model/either'
import { Phase, PhaseCreation } from '../../../model/phases'
import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { PhasesService } from '../../../service/phases/phasesService'
import { phasesServiceMock } from '../../mocks/phases/phasesMocks'
import { PhasesController } from '../../../controller/phases/phasesController'

describe('Create phase', () => {
  const loggerConfig = new LoggerConfig()
  const phaseCreation: PhaseCreation = generatePhaseCreation()
  it('returns 201 with the phase', async () => {
    const createdPhase: Phase = generatePhase()
    const phasesService: PhasesService = phasesServiceMock({
      createPhase: jest.fn().mockImplementation(() => {
        return EitherI.Right(createdPhase)
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.createPhase(
      mockRequest(null, phaseCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(201)
    expect(mockResponse.body).toEqual(createdPhase)
    expect(phasesService.createPhase).toBeCalledWith(phaseCreation)
  })

  it('returns 409 with errors', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      createPhase: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Conflict(['error']))
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.createPhase(
      mockRequest(null, phaseCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(409)
    expect(mockResponse.body).toEqual({ errors: ['error'] })
    expect(phasesService.createPhase).toBeCalledWith(phaseCreation)
  })
  it('returns 500', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      createPhase: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.createPhase(
      mockRequest(null, phaseCreation, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(500)
    expect(phasesService.createPhase).toBeCalledWith(phaseCreation)
  })
})
