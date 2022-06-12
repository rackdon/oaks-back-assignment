import { Router } from 'express'
import { validateBody, validateQueryParams } from './validators/validator'
import { PhasesController } from '../controller/phases/phasesController'
import { PhasesCreationValidator } from './validators/phases/phasesCreationValidator'
import { PhasesFilterValidator } from './validators/phases/phasesFiltersValidator'
import { TasksController } from '../controller/tasks/tasksController'
import { TasksCreationValidator } from './validators/tasks/tasksCreationValidator'
import { TasksFilterValidator } from './validators/tasks/tasksFiltersValidator'
import { PhaseFilterValidator } from './validators/phases/phaseFiltersValidator'
import { PhasesEditionValidator } from './validators/phases/phasesEditionValidator'

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

    this.router.patch(
      '/phases/:id',
      validateBody(PhasesEditionValidator.ValidationInstance),
      phasesController.editPhase
    )

    this.router.get(
      '/phases',
      validateQueryParams(PhasesFilterValidator.ValidationInstance),
      phasesController.getPhases
    )

    this.router.get(
      '/phases/:id',
      validateQueryParams(PhaseFilterValidator.ValidationInstance),
      phasesController.getPhaseById
    )

    this.router.delete('/phases/:id', phasesController.deletePhaseById)

    // TASKS

    this.router.post(
      '/tasks',
      validateBody(TasksCreationValidator.ValidationInstance),
      tasksController.createTask
    )

    this.router.get(
      '/tasks',
      validateQueryParams(TasksFilterValidator.ValidationInstance),
      tasksController.getTasks
    )

    this.router.get('/tasks/:id', tasksController.getTaskById)

    this.router.delete('/tasks/:id', tasksController.deleteTaskById)
  }
}
