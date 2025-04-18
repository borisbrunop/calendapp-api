const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_tutorial', {
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
    tutorial_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tutorials',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'user_tutorials',
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
        name: "user_tutorials_users_FK",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "user_tutorials_tutorials_FK",
        using: "BTREE",
        fields: [
          { name: "tutorial_id" },
        ]
      },
    ]
  });
};
