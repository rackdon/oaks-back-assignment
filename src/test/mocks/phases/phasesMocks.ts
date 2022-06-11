import { PhasesRepository } from '../../../repository/phasesRepository'
import { PhasesService } from '../../../service/phases/phasesService'

export function phasesServiceMock(
  args: Record<string, unknown>
): PhasesService {
  return <PhasesService>{
    phasesRepository: args.phasesRepository,
    logger: args.logger,
    createPhase: args.createPhase,
    getPhases: args.getPhases,
  }
}

export function phasesRepositoryMock(
  args: Record<string, unknown>
): PhasesRepository {
  return <PhasesRepository>{
    pgClient: args.pgClient,
    logger: args.logger,
    insertPhase: args.insertPhase,
    getPhases: args.getPhases,
  }
}
