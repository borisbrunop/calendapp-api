const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const paramsValidate = require("../utils/validateParams");
var models = initModels(sequelize);

async function get_quote_type(req, res) {
  try {
    const quote_types = await models.quote_type.findAll({
      where: {
        provider_id: req.query.provider || req.user.dataValues.id,
        enabled: 1,
      },
    });

    if (!!quote_types) {
      res.status(200).json(quote_types);
      return;
    }

    res.status(200).json({ message: "Error getting quote type", error: true });
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function edit_quote_type(req, res) {
  const validParams = ["id"];
  const params = paramsValidate(validParams, req.body);
  if (!params) {
    res.status(200).json({ message: "Bad request", error: true });
    return;
  }
  const newQuote = {
    name: params.name,
    description: params.description,
    questions: params?.questions,
  };

  try {
    const quote_types = await models.quote_type.update(
      {
        ...newQuote,
      },
      {
        where: {
          provider_id: req.user.dataValues.id,
          id: params.id,
          enabled: 1,
        },
      }
    );

    if (!!quote_types) {
      res.status(200).json(quote_types);
      return;
    }

    res.status(200).json({ message: "Error getting quote type", error: true });
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function delete_quote_type(req, res) {
  const validParams = ["id"];
  const params = paramsValidate(validParams, req.body);
  if (!params) {
    res.status(200).json({ message: "Bad request", error: true });
    return;
  }

  try {
    const quote_types = await models.quote_type.update(
      {
        enabled: 0,
      },
      {
        where: {
          provider_id: req.user.dataValues.id,
          id: params.id,
        },
      }
    );

    if (!!quote_types) {
      res.status(200).json(quote_types);
      return;
    }

    res.status(200).json({ message: "Error getting quote type", error: true });
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function create_quote_type(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["name", "description"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const new_quote_type = {
      name: params.name,
      description: params.description,
      provider_id: req.user.dataValues.id,
    };

    if (!!params.questions) {
      new_quote_type.questions = params.questions;
    }

    const response = await models.quote_type.create(new_quote_type);

    if (response) {
      res.status(200).json(response);
      return;
    }

    res.status(200).json({ message: "Error creating quote type", error: true });
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = {
  create_quote_type,
  get_quote_type,
  delete_quote_type,
  edit_quote_type,
};
