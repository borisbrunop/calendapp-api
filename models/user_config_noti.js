const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_config_noti', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    config_noti_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'config_noti',
        key: 'id'
      }
    },
    noti_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'noti_type',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_config_notis',
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
        name: "user_config_notis_users_FK",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "user_config_notis_config_noti_FK",
        using: "BTREE",
        fields: [
          { name: "config_noti_id" },
        ]
      },
      {
        name: "user_config_notis_noti_type_FK",
        using: "BTREE",
        fields: [
          { name: "noti_type_id" },
        ]
      },
    ]
  });
};
