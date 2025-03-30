const { Sequelize, Op } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const { NOTIFICATIONS, NOTIFICATIONS_DATA, changeText } = require("../utils/notifications");
const paramsValidate = require("../utils/validateParams");
const { subMonths } = require("date-fns");
var models = initModels(sequelize);

async function save_token(req, res) {
  try {
    const { token, device } = req.body;

    if(!token){
        res.status(200).json({message: "no token", error: true});
        return
    }

    if(!device){
        res.status(200).json({message: "no device", error: true});
        return
    }

    const find_user_token = await models.push_token.findOne({where: {user_id: req.user.id, device_id: device}})
    const find_token = await models.push_token.findOne({where: {token}})

    if(!find_user_token && !find_token){
        await models.push_token.destroy({where: {user_id: req.user.id, device_id: device}})
        await models.push_token.create({
            user_id: req.user.id,
            token,
            device_id: device
        })
        res.status(200).json({messagge: "token created"});
        return
    }

    if(!!find_user_token && find_user_token.token === token){
        res.status(200).json({messagge: "token is the same"});
        return
    }

    if((!!find_user_token && find_user_token.token !== token) || (!!find_token && !find_user_token)){
        await models.push_token.destroy({where: {token}})
        await models.push_token.destroy({where: {user_id: req.user.id, device_id: device}})
        await models.push_token.create({
            user_id: req.user.id,
            token,
            device_id: device
        })
        res.status(200).json({messagge: "token changed"});
        return
    }

    res.status(200).json({message: "DONE"});
  } catch (error) {
    console.log("create token::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_notis(req, res) {
  try {

    const response = []
    const noti_type = await models.noti_type.findAll();
    const my_notis = await models.user_config_noti.findAll({where: {user_id: req.user.id}})
    
    for(let n of noti_type){
        if(n.id === NOTIFICATIONS.QUOTES_STARTING) continue
        const object_push = {
            ...n.dataValues,
            my: undefined
        }
        const find = my_notis.find((f) => f.noti_type_id === n.id)
        if(find) object_push.my = find
        response.push(object_push)
    }
    
    const schedule_starting = await models.config_noti.findAll()
    const find_quote_starting = noti_type.find((f) => f.id === NOTIFICATIONS.QUOTES_STARTING)
    schedule_starting.shift()
    const object_push = {
        ...find_quote_starting.dataValues,
        schedule: []
    }
    for(let s of schedule_starting){
        const inner_obj = {...s.dataValues, my: undefined}
        const find = my_notis.find((f) => f.noti_type_id === NOTIFICATIONS.QUOTES_STARTING && f.config_noti_id === s.id)
        if(find)  inner_obj.my = find
        object_push.schedule.push(inner_obj)
    }
    response.push(object_push)

    res.status(200).json(response);
  } catch (error) {
    console.log("get notis::Error ", error);
    res.status(500).json({ error });
  }
}
async function see_my_notis(req, res) {
  try {

    await models.notification.update(
      {
        state: "seen",
      },
      {
        where: {
          user_id: req.user.id, 
          state: "sent",
        },
      }
    );

    res.status(200).json({message: "DONE"});

  } catch (error) {
    console.log("get notis::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_my_notis(req, res) {
  try {
    const validParams = ["tz"];
    const params = paramsValidate(validParams, req.query);
  
    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const oneMonthAgo = subMonths(new Date(), 1);

    const my_notis = await models.notification.findAll({
      attributes: [
        "id",
        "name",
        "user_id",
        "state",
        [
            Sequelize.fn('CONVERT_TZ', Sequelize.col('created_at'), '+00:00', params.tz) 
            ,
          'created_at'
        ],
      ],
      where: {
        user_id: req.user.id,
        created_at: {
          [Op.gt]: oneMonthAgo,
        }
      },
      include: [{
        model: models.user,
        as: "user",
        attributes: ["id", "name"],
      }],
      order: [["created_at", "DESC"]],
    })

    const response = my_notis.map((n) => ({
      ...n.dataValues,
      user: n.dataValues.user.dataValues,
      ...NOTIFICATIONS_DATA[NOTIFICATIONS[n.dataValues.name]],
    }))

    res.status(200).json(response);

  } catch (error) {
    console.log("get notis::Error ", error);
    res.status(500).json({ error });
  }
}

async function change_notis(req, res) {
  try {
    const {type_id, config_noti_id} = req.body

    if(!!config_noti_id){
        const find = await models.user_config_noti.findOne({where: {user_id: req.user.id, noti_type_id: type_id, config_noti_id}})
        if(!!find){
            await find.destroy();
            res.status(200).json("deleted");
            return
        }
        if(!find){
            await models.user_config_noti.create({
                user_id: req.user.id,
                config_noti_id,
                noti_type_id: type_id
            });
            res.status(200).json("created");
            return
        }
        res.status(200).json("error")
        return
    };


    const find = await models.user_config_noti.findOne({where: {user_id: req.user.id, noti_type_id: type_id, config_noti_id: -1}})

    if(!!find){
        await find.destroy();
        res.status(200).json("deleted");
        return
    }
    if(!find){
        await models.user_config_noti.create({
            user_id: req.user.id,
            config_noti_id: -1,
            noti_type_id: type_id
        });
        res.status(200).json("created");
        return
    }
    
    res.status(200).json("error");
  } catch (error) {
    console.log("get notis::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = { save_token, get_notis, change_notis, get_my_notis, see_my_notis };
