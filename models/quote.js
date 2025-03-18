const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quote', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    from: {
      type: DataTypes.DATE,
      allowNull: false
    },
    to: {
      type: DataTypes.DATE,
      allowNull: false
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      references: {
        model: 'quote_status',
        key: 'id'
      }
    },
    quote_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quote_type',
        key: 'id'
      }
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'quotes',
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
        name: "quotes_users_FK",
        using: "BTREE",
        fields: [
          { name: "provider_id" },
        ]
      },
      {
        name: "quotes_users_FK_1",
        using: "BTREE",
        fields: [
          { name: "patient_id" },
        ]
      },
      {
        name: "quotes_id_IDX",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "quotes_quote_status_FK",
        using: "BTREE",
        fields: [
          { name: "status_id" },
        ]
      },
      {
        name: "quotes_quote_type_FK",
        using: "BTREE",
        fields: [
          { name: "quote_type_id" },
        ]
      },
    ]
  });
};
