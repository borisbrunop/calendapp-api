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
  .route("/my")
  .get(validateMiddleware.validateUser, NotificationsController.get_my_notis);

router
  .route("/see")
  .put(validateMiddleware.validateUser, NotificationsController.see_my_notis);

router
  .route("/")
  .put(validateMiddleware.validateUser, NotificationsController.change_notis);

module.exports = router;