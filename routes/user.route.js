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

module.exports = router;
