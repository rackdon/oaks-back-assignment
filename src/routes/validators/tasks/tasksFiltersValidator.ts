/* eslint-disable  @typescript-eslint/no-explicit-any */

import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator'
import { PaginationValidator } from '../paginationValidator'
import { PaginatedTasksFilters } from '../../../model/tasks'

export class TasksFilterValidator extends PaginationValidator {
  @IsOptional()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsBooleanString()
  done!: boolean

  @IsOptional()
  @IsUUID()
  phaseId!: Date

  private constructor(obj: Record<string, any>) {
    super()
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [TasksFilterValidator, TasksFilterValidator] {
    const baseFilters: PaginatedTasksFilters = {
      name: '',
      done: false,
      phaseId: '',
      page: 1,
      pageSize: 1,
      sort: '',
      sortDir: 'ASC',
    }
    const baseInstance = new TasksFilterValidator(baseFilters)
    const instance = new TasksFilterValidator(obj)
    return [instance, baseInstance]
  }
}
