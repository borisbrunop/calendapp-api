var express = require("express");
var router = express.Router();
var UserController = require("../controllers/user.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/role")
  .put(validateMiddleware.validateUser, UserController.change_role);

router
  .route("/")
  .put(validateMiddleware.validateUser, UserController.edit_user);

router
  .route("/donate")
  .post(validateMiddleware.validateUser, UserController.check_donation);

router
  .route("/tutorial")
  .put(validateMiddleware.validateUser, UserController.complete_tutorial);

module.exports = router;
