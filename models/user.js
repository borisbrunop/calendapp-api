const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "users_unique"
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role: {
      type: DataTypes.ENUM('pat','pro'),
      allowNull: true,
      defaultValue: "pat"
    },
    pass: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    find_by: {
      type: DataTypes.ENUM('pat','pro'),
      allowNull: false,
      defaultValue: "pat"
    },
    notification_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tutorial_complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'users',
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
        name: "users_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "users_id_IDX",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
