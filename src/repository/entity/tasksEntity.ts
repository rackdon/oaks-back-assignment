import { DataTypes, ModelAttributes, Sequelize } from 'sequelize'

export class TasksEntity {
  private readonly table: string = 'tasks'
  private readonly taskModel: ModelAttributes = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    phaseId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      references: 'phases',
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      allowNull: false,
    },
    updatedOn: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
      allowNull: false,
    },
  }

  constructor(sequelize: Sequelize) {
    sequelize.define('Task', this.taskModel, {
      tableName: this.table,
      timestamps: false,
      underscored: true,
    })
  }
}
