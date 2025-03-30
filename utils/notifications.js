const { default: Expo } = require("expo-server-sdk");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const { subMinutes, addMinutes } = require("date-fns");
const { notificationQueue } = require("./BullIoRedis");
var models = initModels(sequelize);

const expo = new Expo();

// interface notis prop
// {
//  user: number,
//  notification: number
//  params: string[]
//  time?: new Date()
// }[]

async function sendNotification(notis) {

    const notis_formated = []

    for(let n of notis){
        const users = await models.push_token.findAll({where: {user_id: n.user}})
        for(let u of users){
            if(!!u){
                const noti_data = NOTIFICATIONS_DATA[n.notification]
                const obj_to_push = {
                    to: u.dataValues.token, 
                    title: noti_data.title,
                    body: n.params ? changeText(n.notification, n.params) : noti_data.description, 
                }
                if(n.time) obj_to_push.scheduledAt = n.time.getTime()
                await models.notification.create({
                    user_id: n.user,
                    name: NOTIFICATIONS_DATA[n.notification].name,
                })
                notis_formated.push(obj_to_push)
            }
        }
    }
    
    if(notis_formated?.length > 0){
        const ticketChunk = await expo.sendPushNotificationsAsync(notis_formated, {
            priority: 'high',
          });
    }
}

// interface notis prop
// {
//  user: number,
//  notification: number
//  params: string[]
//  time?: new Date()
// }[]

async function send_schedule_starting(notis) {
        for(let n of notis){
            const users = await models.push_token.findAll({where: {user_id: n.user}})
            for(let u of users){
                const notis_config = await models.user_config_noti.findAll({
                    include: [
                        {          
                            model: models.config_noti,
                            as: "config_noti",
                            attributes: ["time", "name"],
                        }
                    ],
                    where: {user_id: u.user_id, noti_type_id: n.notification}
                })
                const noti_data = NOTIFICATIONS_DATA[n.notification]
                for(let nc of notis_config.map((c) => ({sub: c.dataValues.config_noti.dataValues.time, name: c.dataValues.config_noti.dataValues.name}))){
                    const notifyAt = new Date(n.time.getTime() - nc.sub * 60000);
                    const delay = notifyAt.getTime() - Date.now();
                    if (delay > 0) {
                        notificationQueue.add(
                          {
                            pushToken: u.dataValues.token,
                            message: changeText(n.notification, [nc.name]),
                            title: noti_data.title,
                            name: noti_data.name,
                            user: n.user
                          },
                          { delay }
                        );
                      }
                }
                }
        }

}

async function send_schedule_boolean(notis) {
        for(let n of notis){
            const check_config = await models.user_config_noti.findOne({where: {user_id: n.user, config_noti_id: -1, noti_type_id: n.notification}})
            if(!check_config) continue
            const users = await models.push_token.findAll({where: {user_id: n.user}})
            for(let u of users){
                const noti_data = NOTIFICATIONS_DATA[n.notification]
                const delay = n.time.getTime() - Date.now();
                if (delay > 0) {
                    notificationQueue.add(
                        {
                        pushToken: u.dataValues.token,
                        message: noti_data.description,
                        title: noti_data.title,
                        name: noti_data.name,
                        user: n.user
                        },
                        { delay }
                    );
                }
            }
        }

}





// interface NOTIS
// {
//  notification: number
//  params: string[]
// }

const changeText = (notification, params) => {
    let return_text = NOTIFICATIONS_DATA[notification].description
    for(let i in params){
        const p = params[i]
        const placeholder = `%${Number(i) + 1}%`;
        return_text = return_text.replace(placeholder, p);
    }
    return return_text
}

const NOTIFICATIONS = {
    QUOTE_CREATED: 1,
    CONCURRENT_QUOTE_CREATED: 2,
    QUOTES_STARTING: 3,
    QUOTES_FINISH: 4,
    CANCEL_QUOTE: 5,
    CONFIRM_QUOTE: 6,
}

const NOTIFICATIONS_DATA = {
    1: {
        title: "New Quote 🥂",
        description: "check your calendar to confirm this new quote",
        descriptionClient: "check your calendar to confirm this new quote",
        redirect: "/calendar",
        name: "QUOTE_CREATED"
    },
    2: {
        title: "New Concurrent Quotes 🎉",
        description: "check your calendar to make sure this action is OK !",
        descriptionClient: "check your calendar to make sure this action is OK !",
        redirect: "/calendar",
        name: "CONCURRENT_QUOTE_CREATED"
    },
    3: {
        title: "Hurry up you have a Quote 🏃🏻‍♂️",
        description: "your quote start in %1%",
        descriptionClient: "your quote start in soon",
        redirect: "/calendar",
        name: "QUOTES_STARTING"
    },
    4: {
        title: "Quote Finished 👍🏼",
        description: "till the next quote",
        descriptionClient: "till the next quote",
        redirect: "/calendar",
        name: "QUOTES_FINISH"
    },
    5: {
        title: "Quote cancelled 😭",
        description: "your %1% cancelled your quote",
        descriptionClient: "Cancelled your quote",
        redirect: "/calendar",
        name: "CANCEL_QUOTE"
    },
    6: {
        title: "Quote confirmed 😎",
        description: "now just wait to the day !",
        descriptionClient: "now just wait to the day !",
        redirect: "/calendar",
        name: "CONFIRM_QUOTE"
    },
}

module.exports = {
    sendNotification,
    NOTIFICATIONS,
    NOTIFICATIONS_DATA,
    send_schedule_starting,
    send_schedule_boolean,
    changeText
};