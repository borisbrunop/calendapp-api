const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASS,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    timezone: "UTC",
    logging: false,
    dialectModule: require('mysql2'),
    dialectOptions: {
      timezone: "+00:00",
    },
  }
);

sequelize
  .authenticate()
  .then((res) => console.log("Sequelize Connected... "))
  .catch((err) => console.log("Error... ", err));

module.exports = sequelize;
