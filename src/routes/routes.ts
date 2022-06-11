import { Router } from 'express'
import { validateBody, validateQueryParams } from './validators/validator'
import { PhasesController } from '../controller/phases/phasesController'
import { PhasesCreationValidator } from './validators/phases/phasesCreationValidator'
import { PhasesFilterValidator } from './validators/phases/phasesFiltersValidator'
import { TasksController } from '../controller/tasks/tasksController'
import { TasksCreationValidator } from './validators/tasks/tasksCreationValidator'

export class Routes {
  readonly router: Router = Router()

  constructor(
    phasesController: PhasesController,
    tasksController: TasksController
  ) {
    // PHASES

    this.router.post(
      '/phases',
      validateBody(PhasesCreationValidator.ValidationInstance),
      phasesController.createPhase
    )

    this.router.get(
      '/phases',
      validateQueryParams(PhasesFilterValidator.ValidationInstance),
      phasesController.getPhases
    )

    // TASKS

    this.router.post(
      '/tasks',
      validateBody(TasksCreationValidator.ValidationInstance),
      tasksController.createTask
    )
  }
}
