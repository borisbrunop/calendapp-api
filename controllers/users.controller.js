const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const paramsValidate = require("../utils/validateParams");
const secrets = require("../config/secrets");
const { QueryTypes, Op } = require("sequelize");
const saltRounds = 10;

async function auth(req, res) {
  try {
    //response
    const validParams = ["email", "pass"];
    const params = paramsValidate(validParams, req.body);
    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const user = await models.user.findOne({
      where: { email: params.email },
    });

    if (!user) {
      res.status(200).json({ message: "User not exists", error: true });
      return;
    }

    const match = await bcrypt.compare(params.pass, user.pass);

    if (match) {
      const token = jwt.sign({ id: user.id }, secrets.jwtSecret, {
        expiresIn: 360000,
      });

      delete user.dataValues.pass;

      const query = `
      SELECT c.id, c.name FROM categories c
	        INNER JOIN user_category uc ON uc.category_id = c.id 
      WHERE uc.user_id = :id`;

      const categories = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { id: user.dataValues.id },
      });

      res.status(200).json({
        ...user.dataValues,
        token,
        categories: categories,
      });
      return;
    }

    res
      .status(200)
      .json({ message: "Email and password does'nt match", error: true });
  } catch (error) {
    console.log("auth() error", error);
    res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    //Valid Params

    const validParams = ["email", "pass", "name"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const checkUser = await models.user.findOne({
      where: { email: params.email },
    });

    if (!!checkUser) {
      res.status(200).json({ message: "User exists", error: true });
      return;
    }

    const password = params.pass;

    //encrypt password and Set Password Encrypted
    params.pass = bcrypt.hashSync(password, saltRounds);

    //Execute the User Creation
    const result = await models.user.create(params);

    if (!result) {
      res.status(200).json({ message: "Error creating user", error: true });
      return;
    }

    const token = jwt.sign({ id: result.id }, secrets.jwtSecret, {
      expiresIn: 360000,
    });

    delete result.dataValues.pass;

    res.status(200).json ({
      ...result.dataValues,
      token,
    });
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

const ave_roles = ['pro', 'pat']

async function get_users(req, res) {
  try {
    const { search, role } = req.query;
    let users = [];

    if(!role || !ave_roles.includes(role)){
        res.status(200).json({ message: "Bad request, missing role", error: true });
        return;
    }

    if (!search) {
      users = await models.user.findAll({
        attibutes: ["id", "name"],
        include: [{
          model: models.user_category,
          as: 'user_categories',
          include: [{
            model: models.category,
            attibutes: ["name"],
            as: "category"
          }]
        }],
        where:{
          find_by: role,
        },
        limit: 10,
      });
    }
    if (!!search) {
      users = await models.user.findAll({
        attibutes: ["id", "name", "email", "summary"],
        include: [{
          model: models.user_category,
          as: 'user_categories',
          include: [{
            model: models.category,
            attibutes: ["name"],
            as: "category"
          }]
        }],
        where: {
          find_by: role,
          [Op.or]: {
            email: { [Op.like]: `%${search}%` },
            name: { [Op.like]: `%${search}%` },
          },
          
        },
        limit: 10,
      });
    }

    let usersRes = users?.map((u) => ({...u.dataValues, user_categories: u.dataValues.user_categories.map((uc) => uc.dataValues.category.name)})).filter((f) => f.id !== req.user.dataValues.id) || []
    
    for(let i in usersRes){
      const u = usersRes[i]
      const isMyProvider = await models.provider_patient.findOne({
        where: {
          provider_id: u.id,
          patient_id: req.user.dataValues.id
        }
      })
      usersRes[i] = {...u, isMyProvider: !!isMyProvider}
    }

    res.status(200).json(usersRes);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = { auth, create, get_users };
