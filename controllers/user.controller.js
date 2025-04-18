const { QueryTypes } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const paramsValidate = require("../utils/validateParams");
var models = initModels(sequelize);
const bcrypt = require("bcrypt");
const { check_binance_donation } = require("../utils/binanceCall");
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

async function complete_tutorial(req, res) {
  try {
    await models.user.update({
      tutorial_complete: true
    }, {
      where: {
        id: req.user.id
      }
    })
    res.status(200).json({tutorial_complete: true});
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function check_donation(req, res) {
  // const { asset, amount, address, memo } = req.body;
  const validParams = ["asset", "amount", "orderId"];
  const params = paramsValidate(validParams, req.body);
  if (!params) {
    res.status(200).json({ message: "Bad request", error: true });
    return;
  }

  try {
    const check_binance = await check_binance_donation(params)


    if(!!check_binance?.error){
      res.status(400).json(check_binance)
      return;
    }
    const create_donation = {
      user_id: req.user.id,
      amount: params.amount,
      order: params.orderId,
    }

    
    if(check_binance){
      create_donation.status = "ver"
    }


    const check = await models.donation.findOne({
      where: {
        order: params.orderId
      }
    })
    if(check){
      res.status(200).json({error: true, message: "Order already created"});
      return
    }
    
    const new_donation = await models.donation.create(create_donation)

    res.status(200).json({status: new_donation.status});
  } catch (error) {
    console.log("check donation user::Error ", error);
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

module.exports = { change_role, edit_user, check_donation, complete_tutorial };
