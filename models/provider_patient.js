const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('provider_patient', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'provider_patients',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "provider_patients_users_FK",
        using: "BTREE",
        fields: [
          { name: "patient_id" },
        ]
      },
      {
        name: "provider_patients_users_FK_1",
        using: "BTREE",
        fields: [
          { name: "provider_id" },
        ]
      },
      {
        name: "provider_patients_id_IDX",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
