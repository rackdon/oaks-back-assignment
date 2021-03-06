/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */

import winston from 'winston'
import {
  ApiError,
  BadRequest,
  Conflict,
  Forbidden,
  Internal,
  NotFound,
} from '../../model/error'
import { PhasesService } from '../../service/phases/phasesService'
import { Phase } from '../../model/phases'
import { DataWithPages } from '../../model/pagination'
import { Logger } from '../../service/server/logger'

export class PhasesController {
  readonly phasesService: PhasesService
  readonly logger: Logger

  constructor(phasesService: PhasesService, loggerConfig: winston.Logger) {
    this.phasesService = phasesService
    this.logger = new Logger(PhasesController.name, loggerConfig)
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

  editPhase = async (req, res): Promise<void> => {
    const result = await this.phasesService.editPhase(req.params.id, req.body)
    result.fold(
      (error: ApiError) => {
        switch (error.constructor) {
          case BadRequest: {
            res.status(400).json(error)
            break
          }
          case NotFound: {
            res.status(404).send()
            break
          }
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
      (phase: Phase) => res.status(200).json(phase)
    )
  }

  getPhases = async (req, res): Promise<void> => {
    const result = await this.phasesService.getPhases(req.query)
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case BadRequest: {
            res.status(400).json(error)
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
      (phases: DataWithPages<Phase>) => res.status(200).json(phases)
    )
  }

  getPhaseById = async (req, res): Promise<void> => {
    const result = await this.phasesService.getPhaseById(
      req.params.id,
      req.query
    )
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case NotFound: {
            res.status(404).send()
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
      (phase: Phase) => res.status(200).json(phase)
    )
  }

  deletePhaseById = async (req, res): Promise<void> => {
    const result = await this.phasesService.deletePhaseById(req.params.id)
    result.fold(
      (error: ApiError) => {
        switch (error?.constructor) {
          case Forbidden: {
            res.status(403).send()
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
      () => res.status(204).send()
    )
  }
}
