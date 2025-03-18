const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
var models = initModels(sequelize);

async function validateUser(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      next(createHttpError(401)); // if there isn't any token
    }
    //Find the user who is creating the appt
    // req.security = await UserController.findUserByJWT(token, null);
    const jwtDecoded = jwt.decode(token, { complete: true });
    //const jwtDecoded2 = jwt.verify(jwtParam, secrets.jwtSecret);

    //The UserId owner of JWT
    const userId = jwtDecoded.payload.id;

    const user = await models.user.findOne({
      where: { id: userId },
    });

    req.user = user;
    next();
  } catch (error) {
    console.log("validateCurrentUserByToken::Error", error);
    next(createHttpError(401));
  }
}

module.exports = { validateUser };
