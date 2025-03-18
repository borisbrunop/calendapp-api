const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASS,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
    timezone: "-06:00",
    logging: false,
    dialectModule: require('mysql2'),
  }
);

sequelize
  .authenticate()
  .then((res) => console.log("Sequelize Connected... "))
  .catch((err) => console.log("Error... ", err));

module.exports = sequelize;
