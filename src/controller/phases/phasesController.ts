/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */

import winston from 'winston'
import { LoggerConfig } from '../../configuration/loggerConfig'
import {
  ApiError,
  Conflict,
  Internal,
} from '../../model/error'
import { PhasesService } from '../../service/phases/phasesService'
import { Phase } from '../../model/phases'

export class PhasesController {
  readonly phasesService: PhasesService
  readonly logger: winston.Logger

  constructor(phasesService: PhasesService, loggerConfig: LoggerConfig) {
    this.phasesService = phasesService
    this.logger = loggerConfig.create(PhasesController.name)
  }

  createPhase = async (req, res): Promise<void> => {
    const result = await this.phasesService.createPhase(req.body)
    result.fold(
      (error: ApiError) => {
        switch (error.constructor) {
          case Conflict: {
            res.status(409).json(error)
            break
          }
          case Internal: {
            res.status(500).send()
            break
          }
          default: {
            this.logger.warn(`Unexpected error: ${error}`)
            res.status(500).send()
          }
        }
      },
      (phase: Phase) => res.status(201).json(phase)
    )
  }
}
