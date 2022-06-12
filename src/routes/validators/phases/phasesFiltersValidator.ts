/* eslint-disable  @typescript-eslint/no-explicit-any */

import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'
import { PaginationValidator } from '../paginationValidator'
import { PaginatedPhasesFilters, PhaseProjection } from '../../../model/phases'

export class PhasesFilterValidator extends PaginationValidator {
  @IsOptional()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsBooleanString()
  done!: boolean

  @IsOptional()
  @IsDateString()
  createdBefore!: Date

  @IsOptional()
  @IsDateString()
  createdAfter!: Date

  @IsOptional()
  @IsEnum(['PhaseRaw', 'PhaseWithTasks'], {
    message: 'projection only accept PhaseRaw or PhaseWithTasks',
  })
  projection!: PhaseProjection

  private constructor(obj: Record<string, any>) {
    super()
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [PhasesFilterValidator, PhasesFilterValidator] {
    const baseFilters: PaginatedPhasesFilters = {
      name: '',
      done: false,
      createdBefore: new Date(),
      createdAfter: new Date(),
      projection: 'PhaseRaw',
      page: 1,
      pageSize: 1,
      sort: '',
      sortDir: 'ASC',
    }
    const baseInstance = new PhasesFilterValidator(baseFilters)
    const instance = new PhasesFilterValidator(obj)
    return [instance, baseInstance]
  }
}
