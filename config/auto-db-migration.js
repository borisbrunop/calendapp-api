const SequelizeAuto = require("sequelize-auto");
const Sequelize = require("sequelize");
const dotEnv = require("dotenv").config();

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASS;
const database = process.env.DATABASE_NAME;

const auto = new SequelizeAuto(database, user, password, {
  host: host,
  dialect: "mysql",
  directory: "./models", // where to write files
  port: "3306",
  singularize: true, // convert plural table names to singular model names
  additional: {
    timestamps: false,
  },
  // tables: ["patients", "background"], // use all tables, if omitted
});

auto.run();
