import { PhasesDbRepository } from '../../../repository/phases/phasesDbRepository'
import { PhasesService } from '../../../service/phases/phasesService'

export function phasesServiceMock(
  args: Record<string, unknown>
): PhasesService {
  return <PhasesService>{
    phasesRepository: args.phasesRepository,
    logger: args.logger,
    createPhase: args.createPhase,
    editPhase: args.editPhase,
    getPhases: args.getPhases,
    getPhaseById: args.getPhaseById,
    deletePhaseById: args.deletePhaseById,
  }
}

export function phasesRepositoryMock(
  args: Record<string, unknown>
): PhasesDbRepository {
  return <PhasesDbRepository>{
    dbClient: args.pgClient,
    logger: args.logger,
    insertPhase: args.insertPhase,
    updatePhase: args.updatePhase,
    getPhases: args.getPhases,
    getPhaseById: args.getPhaseById,
    deletePhaseById: args.deletePhaseById,
  }
}
