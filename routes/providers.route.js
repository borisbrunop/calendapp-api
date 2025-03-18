var express = require("express");
var router = express.Router();
var ProviderController = require("../controllers/providers.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/check")
  .get(validateMiddleware.validateUser, ProviderController.check);

module.exports = router;