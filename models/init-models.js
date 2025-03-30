var DataTypes = require("sequelize").DataTypes;
var _category = require("./category");
var _config_noti = require("./config_noti");
var _device = require("./device");
var _noti_type = require("./noti_type");
var _notification = require("./notification");
var _provider_patient = require("./provider_patient");
var _push_token = require("./push_token");
var _quote_status = require("./quote_status");
var _quote_time = require("./quote_time");
var _quote_type = require("./quote_type");
var _quote = require("./quote");
var _user_category = require("./user_category");
var _user_config_noti = require("./user_config_noti");
var _user = require("./user");

function initModels(sequelize) {
  var category = _category(sequelize, DataTypes);
  var config_noti = _config_noti(sequelize, DataTypes);
  var device = _device(sequelize, DataTypes);
  var noti_type = _noti_type(sequelize, DataTypes);
  var notification = _notification(sequelize, DataTypes);
  var provider_patient = _provider_patient(sequelize, DataTypes);
  var push_token = _push_token(sequelize, DataTypes);
  var quote_status = _quote_status(sequelize, DataTypes);
  var quote_time = _quote_time(sequelize, DataTypes);
  var quote_type = _quote_type(sequelize, DataTypes);
  var quote = _quote(sequelize, DataTypes);
  var user_category = _user_category(sequelize, DataTypes);
  var user_config_noti = _user_config_noti(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);

  user_category.belongsTo(category, { as: "category", foreignKey: "category_id"});
  category.hasMany(user_category, { as: "user_categories", foreignKey: "category_id"});
  user_config_noti.belongsTo(config_noti, { as: "config_noti", foreignKey: "config_noti_id"});
  config_noti.hasMany(user_config_noti, { as: "user_config_notis", foreignKey: "config_noti_id"});
  push_token.belongsTo(device, { as: "device", foreignKey: "device_id"});
  device.hasMany(push_token, { as: "push_tokens", foreignKey: "device_id"});
  user_config_noti.belongsTo(noti_type, { as: "noti_type", foreignKey: "noti_type_id"});
  noti_type.hasMany(user_config_noti, { as: "user_config_notis", foreignKey: "noti_type_id"});
  quote.belongsTo(quote_status, { as: "status", foreignKey: "status_id"});
  quote_status.hasMany(quote, { as: "quotes", foreignKey: "status_id"});
  quote_time.belongsTo(quote_type, { as: "quote_type", foreignKey: "quote_type_id"});
  quote_type.hasMany(quote_time, { as: "quote_times", foreignKey: "quote_type_id"});
  quote.belongsTo(quote_type, { as: "quote_type", foreignKey: "quote_type_id"});
  quote_type.hasMany(quote, { as: "quotes", foreignKey: "quote_type_id"});
  notification.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(notification, { as: "notifications", foreignKey: "user_id"});
  provider_patient.belongsTo(user, { as: "patient", foreignKey: "patient_id"});
  user.hasMany(provider_patient, { as: "provider_patients", foreignKey: "patient_id"});
  provider_patient.belongsTo(user, { as: "provider", foreignKey: "provider_id"});
  user.hasMany(provider_patient, { as: "provider_provider_patients", foreignKey: "provider_id"});
  push_token.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(push_token, { as: "push_tokens", foreignKey: "user_id"});
  quote_type.belongsTo(user, { as: "provider", foreignKey: "provider_id"});
  user.hasMany(quote_type, { as: "quote_types", foreignKey: "provider_id"});
  quote.belongsTo(user, { as: "provider", foreignKey: "provider_id"});
  user.hasMany(quote, { as: "quotes", foreignKey: "provider_id"});
  quote.belongsTo(user, { as: "patient", foreignKey: "patient_id"});
  user.hasMany(quote, { as: "patient_quotes", foreignKey: "patient_id"});
  user_category.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(user_category, { as: "user_categories", foreignKey: "user_id"});
  user_config_noti.belongsTo(user, { as: "user", foreignKey: "user_id"});
  user.hasMany(user_config_noti, { as: "user_config_notis", foreignKey: "user_id"});

  return {
    category,
    config_noti,
    device,
    noti_type,
    notification,
    provider_patient,
    push_token,
    quote_status,
    quote_time,
    quote_type,
    quote,
    user_category,
    user_config_noti,
    user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
