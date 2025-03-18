const { QueryTypes } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const paramsValidate = require("../utils/validateParams");
var models = initModels(sequelize);
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function change_role(req, res) {
  try {
    if (req.user.dataValues.role === "pat") {
      req.user.role = "pro";
      await req.user.save();
      res.status(200).json(req.user.dataValues);
      return;
    }
    if (req.user.dataValues.role === "pro") {
      req.user.role = "pat";
      await req.user.save();
      res.status(200).json(req.user.dataValues);
      return;
    }
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function edit_user(req, res) {
  try {
    const validParams = ["name"];
    const params = paramsValidate(validParams, req.body);
    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    if (params.pass) {
      const password = params.pass;
      params.pass = bcrypt.hashSync(password, saltRounds);
    }

    if (params.categories?.length > 0) {
      const user_categories = await models.user_category.findAll({
        where: { user_id: req.user.dataValues.id },
      });
      for (let c of params.categories) {
        const search_category = await models.category.findOne({
          where: { id: c.id },
        });

        if (!search_category) {
          const new_category = await models.category.create({ name: c.name });
          await models.user_category.create({
            user_id: req.user.dataValues.id,
            category_id: new_category?.id,
          });
        }
        if (
          search_category &&
          !user_categories.find((f) => f.dataValues.id === c.id)
        ) {
          await models.user_category.create({
            user_id: req.user.dataValues.id,
            category_id: c.id,
          });
        }
      }
      for (let uc of user_categories) {
        if (!params.categories.find((f) => f.id === uc.dataValues.id)) {
          await uc.destroy();
        }
      }
    }

    req.user.name = params.name;
    req.user.summary = params.summary || "";
    req.user.find_by = params.find_by;
    if (params.pass) {
      req.user.pass = params.pass;
    }

    await req.user.save();

    const query = `
    SELECT c.id, c.name FROM categories c
        INNER JOIN user_category uc ON uc.category_id = c.id 
    WHERE uc.user_id = :id`;

    const categories = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { id: req.user.dataValues.id },
    });

    delete req.user.dataValues.pass;

    res.status(200).json({
      ...req.user.dataValues,
      categories: categories,
    });
  } catch (error) {
    console.log("edit user::Error ", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { change_role, edit_user };
