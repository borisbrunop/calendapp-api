const { Op } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
var models = initModels(sequelize);

async function check(req, res) {
  try {
    let check = false
    const checkUser = req.query.user
    if (req.user.dataValues.role === "pat") {
        const find_provider = await models.provider_patient.findOne({
            where: {
                patient_id: req.user.dataValues.id,
                provider_id: checkUser
            }
          });
          check = !!find_provider
        }
    if (req.user.dataValues.role === "pro") {
            const find_patient = await models.provider_patient.findOne({
                where: {
                    patient_id: checkUser,
                    provider_id: req.user.dataValues.id
                }
              });

              check = !!find_patient
            
    }

    res.status(200).json(check);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = { check };
