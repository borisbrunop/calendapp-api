var express = require("express");
var router = express.Router();
var QuoteTimeController = require("../controllers/quote_times.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/")
  .get(validateMiddleware.validateUser, QuoteTimeController.get_quote_time);

router
  .route("/add")
  .get(
    validateMiddleware.validateUser,
    QuoteTimeController.get_time_to_add_quote
  );

router
  .route("/add/concurrent")
  .get(
    validateMiddleware.validateUser,
    QuoteTimeController.get_time_to_add_quote_concurrent
  );

router
  .route("/")
  .post(validateMiddleware.validateUser, QuoteTimeController.create_quote_time);

router
  .route("/")
  .put(validateMiddleware.validateUser, QuoteTimeController.update_quote_time);

router
  .route("/delete")
  .put(validateMiddleware.validateUser, QuoteTimeController.delete_quote_time);

module.exports = router;
