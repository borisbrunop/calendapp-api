const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('quote_time', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    from: {
      type: DataTypes.TIME,
      allowNull: true
    },
    to: {
      type: DataTypes.TIME,
      allowNull: true
    },
    quote_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quote_type',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    week_day: {
      type: DataTypes.STRING(10),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'quote_times',
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
        name: "quote_times_quote_type_FK",
        using: "BTREE",
        fields: [
          { name: "quote_type_id" },
        ]
      },
      {
        name: "quote_times_id_IDX",
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
