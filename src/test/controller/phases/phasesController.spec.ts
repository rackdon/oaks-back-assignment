/* eslint-disable  @typescript-eslint/no-unused-vars */

import { LoggerConfig } from '../../../configuration/loggerConfig'
import { mockRequest, MockResponse } from '../utils'
import { BadRequest, Conflict, Forbidden, Internal } from '../../../model/error'
import { EitherI } from '../../../model/either'
import { Phase, PhaseCreation } from '../../../model/phases'
import {
  generatePhase,
  generatePhaseCreation,
} from '../../utils/generators/phasesGenerator'
import { PhasesService } from '../../../service/phases/phasesService'
import { phasesServiceMock } from '../../mocks/phases/phasesMocks'
import { PhasesController } from '../../../controller/phases/phasesController'
import { DataWithPages } from '../../../model/pagination'
import { randomUUID } from 'crypto'

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

describe('Get phases', () => {
  const loggerConfig = new LoggerConfig()
  const phaseData: Phase = generatePhase()
  const phases: DataWithPages<Phase> = { data: [phaseData], pages: 1 }
  const query = { pageSize: 5 }
  it('returns 200 with the phases', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Right(phases)
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.getPhases(mockRequest(null, null, query), mockResponse)

    expect(mockResponse.statusCode).toEqual(200)
    expect(mockResponse.body).toEqual(phases)
    expect(phasesService.getPhases).toBeCalledWith(query)
  })

  it('returns 400 with errors', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Left(new BadRequest(['error']))
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.getPhases(mockRequest(null, null, query), mockResponse)

    expect(mockResponse.statusCode).toEqual(400)
    expect(mockResponse.body).toEqual({ errors: ['error'] })
    expect(phasesService.getPhases).toBeCalledWith(query)
  })
  it('returns 500', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      getPhases: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.getPhases(mockRequest(null, null, query), mockResponse)

    expect(mockResponse.statusCode).toEqual(500)
    expect(phasesService.getPhases).toBeCalledWith(query)
  })
})

describe('Delete phases by id', () => {
  const loggerConfig = new LoggerConfig()
  const phaseId = randomUUID()
  it('returns 204', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      deletePhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Right(1)
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.deletePhaseById(
      mockRequest({ id: phaseId }, null, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(204)
    expect(phasesService.deletePhaseById).toBeCalledWith(phaseId)
  })

  it('returns 403', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      deletePhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Forbidden())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.deletePhaseById(
      mockRequest({ id: phaseId }, null, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(403)
    expect(phasesService.deletePhaseById).toBeCalledWith(phaseId)
  })

  it('returns 500', async () => {
    const phasesService: PhasesService = phasesServiceMock({
      deletePhaseById: jest.fn().mockImplementation(() => {
        return EitherI.Left(new Internal())
      }),
    })
    const mockResponse = new MockResponse()
    const controller = new PhasesController(phasesService, loggerConfig)

    await controller.deletePhaseById(
      mockRequest({ id: phaseId }, null, null),
      mockResponse
    )

    expect(mockResponse.statusCode).toEqual(500)
    expect(phasesService.deletePhaseById).toBeCalledWith(phaseId)
  })
})
