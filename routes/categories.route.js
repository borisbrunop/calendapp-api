var express = require("express");
var router = express.Router();
var CategoriesController = require("../controllers/categories.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/")
  .get(validateMiddleware.validateUser, CategoriesController.get_categories);

module.exports = router;
