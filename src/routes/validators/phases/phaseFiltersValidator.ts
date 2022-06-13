/* eslint-disable  @typescript-eslint/no-explicit-any */

import { IsIn, IsOptional } from 'class-validator'
import { PaginatedPhasesFilters, PhaseProjection } from '../../../model/phases'

export class PhaseFilterValidator {
  @IsOptional()
  @IsIn(['PhaseRaw', 'PhaseWithTasks'])
  projection!: PhaseProjection

  private constructor(obj: Record<string, any>) {
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [PhaseFilterValidator, PhaseFilterValidator] {
    const baseFilters: PaginatedPhasesFilters = {
      projection: 'PhaseRaw',
    }
    const baseInstance = new PhaseFilterValidator(baseFilters)
    const instance = new PhaseFilterValidator(obj)
    return [instance, baseInstance]
  }
}
