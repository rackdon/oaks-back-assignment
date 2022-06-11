import { Sequelize } from 'sequelize'
import { PhasesEntity } from './phasesEntity'
import { TasksEntity } from './tasksEntity'

export class EntitiesInitializer {
  constructor(sequelize: Sequelize) {
    new PhasesEntity(sequelize)
    new TasksEntity(sequelize)
  }
}
