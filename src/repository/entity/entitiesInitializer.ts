import { Sequelize } from 'sequelize'
import { PhasesEntity } from './phasesEntity'

export class EntitiesInitializer {
  constructor(sequelize: Sequelize) {
    new PhasesEntity(sequelize)
  }
}
