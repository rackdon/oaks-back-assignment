/* eslint-disable  @typescript-eslint/no-explicit-any */

import { IsNotEmpty, IsString } from 'class-validator'
import { PhaseCreation } from '../../../model/phases'

export class PhasesCreationValidator {
  @IsString()
  @IsNotEmpty()
  name!: string
  private constructor(obj: Record<string, any>) {
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [PhasesCreationValidator, PhasesCreationValidator] {
    const phaseBaseCreation: PhaseCreation = { name: '' }
    const baseInstance = new PhasesCreationValidator(phaseBaseCreation)
    const instance = new PhasesCreationValidator(obj)
    return [instance, baseInstance]
  }
}
