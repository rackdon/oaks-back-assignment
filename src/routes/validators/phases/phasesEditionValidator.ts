/* eslint-disable  @typescript-eslint/no-explicit-any */

import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { PhaseEdition } from '../../../model/phases'

export class PhasesEditionValidator {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name!: string

  private constructor(obj: Record<string, any>) {
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [PhasesEditionValidator, PhasesEditionValidator] {
    const phaseBaseEdition: PhaseEdition = { name: '' }
    const baseInstance = new PhasesEditionValidator(phaseBaseEdition)
    const instance = new PhasesEditionValidator(obj)
    return [instance, baseInstance]
  }
}
