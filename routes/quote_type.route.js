var express = require("express");
var router = express.Router();
var QueryTypeController = require("../controllers/quote_type.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/get")
  .get(validateMiddleware.validateUser, QueryTypeController.get_quote_type);

router
  .route("/create")
  .post(validateMiddleware.validateUser, QueryTypeController.create_quote_type);

router
  .route("/delete")
  .put(validateMiddleware.validateUser, QueryTypeController.delete_quote_type);

router
  .route("/edit")
  .put(validateMiddleware.validateUser, QueryTypeController.edit_quote_type);

module.exports = router;
