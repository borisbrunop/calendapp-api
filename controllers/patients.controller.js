const { Op } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
var models = initModels(sequelize);

async function get_patients_to_add_quote(req, res) {
  try {
    if (req.user.dataValues.role === "pat") {
      res.status(200).json({ message: "Only Provider", error: true });
      return;
    }
    const { search } = req.query;
    let patients = [];

    if (!search) {
      patients = await models.user.findAll({
        attibutes: ["id", "name"],
        limit: 10,
      });
    }
    if (!!search) {
      patients = await models.user.findAll({
        attibutes: ["id", "name"],
        where: {
          [Op.or]: {
            email: { [Op.like]: `%${search}%` },
            name: { [Op.like]: `%${search}%` },
          },
        },
        limit: 10,
      });
    }

    res
      .status(200)
      .json(patients.filter((f) => f.dataValues.id !== req.user.dataValues.id));
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_patients_provider(req, res) {
  try {
    if (req.user.dataValues.role === "pat") {
      res.status(200).json({ message: "Only Provider", error: true });
      return;
    }
    const { search } = req.query;
    let patients = [];

    if (!search) {
      patients = await models.provider_patient.findAll({
        attributes: ["status", "id"],
        where: {
          provider_id: req.user.dataValues.id,
          status: 1
        },
        limit: 10,
        include: [{
          model: models.user,
          as: "patient",
          attributes: ["id", "name", "email", "summary"],
        }]
      });
    }
    if (!!search) {
      patients = await models.provider_patient.findAll({
        where: {provider_id: req.user.dataValues.id},
        where: {
          provider_id: req.user.dataValues.id,
          status: 1
        },
        attributes: ["status", "id"],
        limit: 10,
        include: [{
          model: models.user,
          as: "patient",
          attributes: ["id", "name", "email", "summary"],
          where: {
            [Op.or]: {
              email: { [Op.like]: `%${search}%` },
              name: { [Op.like]: `%${search}%` },
            },
          },
        }]
      });
    }

    res
      .status(200)
      .json(patients.filter((f) => f.dataValues.id !== req.user.dataValues.id));
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function update_patient_provider(req, res) {
  try {
    if (req.user.dataValues.role === "pat") {
      res.status(200).json({ message: "Only Provider", error: true });
      return;
    }

const {patient} = req.body

    const pro_pat = await models.provider_patient.findOne({
      attributes: ["status", "id"],
      where: {
        patient_id: patient,
        provider_id: req.user.dataValues.id,
        status: 1
      },
    });

    if(!pro_pat){
      res.status(404).json({ message: "Not found", error: true });
      return;
    }

    pro_pat.status = pro_pat.status ? 0 : 1
    await pro_pat.save();

    res.status(200).json(pro_pat);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function create_patient_provider(req, res) {
  try {
    if (req.user.dataValues.role === "pat") {
      res.status(200).json({ message: "Only Provider", error: true });
      return;
    }

    const {patient} = req.body

    const find_pro_pat = await models.provider_patient.findOne({
      attributes: ["status", "id"],
      where: {
        patient_id: patient,
        provider_id: req.user.dataValues.id,
      },
    });

    if(!!find_pro_pat && !!find_pro_pat.status){
      res.status(200).json({ message: "User is already your patient", error: true });
      return;
    }

    if(!!find_pro_pat && !find_pro_pat.status){
      find_pro_pat.status = 1
      await find_pro_pat.save();
  
      res.status(200).json(find_pro_pat);
      return;
    }

    const pro_pat = await models.provider_patient.create({
        patient_id: patient,
        provider_id: req.user.dataValues.id,
    });

    res.status(200).json(pro_pat);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}



module.exports = { 
  get_patients_to_add_quote, 
  get_patients_provider, 
  update_patient_provider, 
  create_patient_provider 
};
