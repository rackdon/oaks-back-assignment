import { Sequelize } from 'sequelize'
import { PhasesEntity } from './phasesEntity'
import { TasksEntity } from './tasksEntity'

export class EntitiesInitializer {
  constructor(sequelize: Sequelize) {
    new TasksEntity(sequelize)
    new PhasesEntity(sequelize)

    sequelize.models.Phase['tasks'] = sequelize.models.Phase.hasMany(
      sequelize.models.Task,
      {
        as: 'tasks',
        foreignKey: 'phase_id',
      }
    )
    sequelize.models.Task['phase'] = sequelize.models.Task.belongsTo(
      sequelize.models.Phase,
      { foreignKey: 'phase_id' }
    )
  }
}
