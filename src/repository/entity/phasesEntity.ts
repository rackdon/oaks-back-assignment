import { DataTypes, ModelAttributes, Sequelize } from 'sequelize'

export class PhasesEntity {
  private readonly table: string = 'phases'
  private readonly phaseModel: ModelAttributes = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      defaultValue: false
    },
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: false,
    },
    updatedOn: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: false,
    },
  }

  constructor(sequelize: Sequelize) {
    sequelize.define('Phase', this.phaseModel, {
      tableName: this.table,
      timestamps: false,
      underscored: true,
    })
  }
}
