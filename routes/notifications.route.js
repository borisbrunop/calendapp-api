var express = require("express");
var router = express.Router();
var NotificationsController = require("../controllers/notifications.controller");
var validateMiddleware = require("../middlewares/authUser");

router
  .route("/token")
  .post(validateMiddleware.validateUser, NotificationsController.save_token);

router
  .route("/")
  .get(validateMiddleware.validateUser, NotificationsController.get_notis);

router
  .route("/")
  .put(validateMiddleware.validateUser, NotificationsController.change_notis);

module.exports = router;