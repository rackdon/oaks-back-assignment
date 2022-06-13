/* eslint-disable  @typescript-eslint/no-explicit-any */

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { TaskEdition } from '../../../model/tasks'

export class TasksEditionValidator {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsEnum([true], { message: 'done can only be true' })
  @IsBoolean()
  done!: boolean
  private constructor(obj: Record<string, any>) {
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [TasksEditionValidator, TasksEditionValidator] {
    const taskBaseEdition: TaskEdition = { name: '', done: true }
    const baseInstance = new TasksEditionValidator(taskBaseEdition)
    const instance = new TasksEditionValidator(obj)
    return [instance, baseInstance]
  }
}
