/* eslint-disable  @typescript-eslint/no-explicit-any */

import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { TaskCreation } from '../../../model/tasks'

export class TasksCreationValidator {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsUUID()
  phaseId!: string
  private constructor(obj: Record<string, any>) {
    Object.assign(this, obj)
  }

  static ValidationInstance(
    obj: Record<string, any>
  ): [TasksCreationValidator, TasksCreationValidator] {
    const taskBaseCreation: TaskCreation = { name: '', phaseId: '' }
    const baseInstance = new TasksCreationValidator(taskBaseCreation)
    const instance = new TasksCreationValidator(obj)
    return [instance, baseInstance]
  }
}
