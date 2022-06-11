import { Router } from 'express'
import { validateBody } from './validators/validator'
import { PhasesController } from '../controller/phases/phasesController'
import { PhasesCreationValidator } from './validators/phases/phasesCreationValidator'

export class Routes {
  readonly router: Router = Router()

  constructor(phasesController: PhasesController) {
    // PHASES

    this.router.post(
      '/phases',
      validateBody(PhasesCreationValidator.ValidationInstance),
      phasesController.createPhase
    )
  }
}
