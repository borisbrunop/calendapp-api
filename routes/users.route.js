var express = require("express");
var router = express.Router();
var UsersController = require("../controllers/users.controller");
var validateMiddleware = require("../middlewares/authUser");


router.route("/create").post(UsersController.create);

router.route("/auth").post(UsersController.auth);

router.route("/search").get(validateMiddleware.validateUser, UsersController.get_users);

module.exports = router;
