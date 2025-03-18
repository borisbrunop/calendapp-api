var express = require("express");
var router = express.Router();
var QuoteController = require("../controllers/quote.controller");
var validateMiddleware = require("../middlewares/authUser");

router.route("/").post(validateMiddleware.validateUser, QuoteController.create);

router
  .route("/calendar")
  .get(validateMiddleware.validateUser, QuoteController.get_quotes_calendar);

router
  .route("/")
  .get(validateMiddleware.validateUser, QuoteController.get_quotes);

router
  .route("/")
  .put(validateMiddleware.validateUser, QuoteController.update_quote);

router
  .route("/delete")
  .put(validateMiddleware.validateUser, QuoteController.delete_quote);

module.exports = router;


