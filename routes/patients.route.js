var express = require("express");
var router = express.Router();
var PatientsController = require("../controllers/patients.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/add_quote")
  .get(validateMiddleware.validateUser, PatientsController.get_patients_to_add_quote);

router
  .route("/")
  .get(validateMiddleware.validateUser, PatientsController.get_patients_provider);

router
  .route("/")
  .put(validateMiddleware.validateUser, PatientsController.update_patient_provider);

router
  .route("/")
  .post(validateMiddleware.validateUser, PatientsController.create_patient_provider);

module.exports = router;
