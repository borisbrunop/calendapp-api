const { Op } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const { sendNotification, NOTIFICATIONS } = require("../utils/notifications");
const { addMinutes } = require("date-fns");
var models = initModels(sequelize);

async function get_categories(req, res) {
  try {
    const { search } = req.query;
    let categories = [];

    if (!search) {
      categories = await models.category.findAll({
        attibutes: ["id", "name"],
        limit: 10,
      });
    }
    if (!!search) {
      categories = await models.category.findAll({
        attibutes: ["id", "name"],
        where: {
          [Op.or]: {
            name: { [Op.like]: `%${search}%` },
          },
        },
        limit: 8,
      });
    }

    res.status(200).json(categories);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = { get_categories };
