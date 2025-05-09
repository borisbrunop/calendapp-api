const Queue = require('bull');
const Redis = require('ioredis');
const sequelize = require("../config/sequilizeConnection");
const { default: Expo } = require("expo-server-sdk");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
const dotEnv = require("dotenv").config();

const notificationQueue = new Queue('notifications', {
    createClient: () => new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        username: 'default',
        password: process.env.REDIS_PASSWORD,
    }),
});

// async function runNotificationQueue () {
//     // Configure queue processing
//     notificationQueue.process(async (job) => {
//         const { pushToken, message, title, name, user } = job.data;
//         const expo = new Expo();
        
//         try {
//             if (!Expo.isExpoPushToken(pushToken)) {
//                 throw new Error(`Invalid push token: ${pushToken}`);
//             }

//             await models.notification.create({
//                 user_id: user,
//                 name,
//             })
            
//             await expo.sendPushNotificationsAsync([{
//                 to: pushToken,
//                 sound: 'default',
//                 title: title,
//                 body: message,
//             }]);
            
//             console.log(`Notification sent to ${pushToken}: ${message}`);
//             return { success: true };
//         } catch (error) {
//             console.error('Notification failed:', error);
//             throw error; // Bull will automatically retry (if configured)
//         }
//     });
    
//     // 4. Add queue error handlers
//     notificationQueue.on('error', (error) => {
//         console.error('Queue error:', error);
//     });
    
//     notificationQueue.on('failed', (job, error) => {
//         console.error(`Job ${job.id} failed:`, error);
//     });

//     notificationQueue.on('completed', (job) => {
//         console.log(`Job ${job.id} completed at ${new Date().toISOString()}`);
//       });
// }


  module.exports = {
    notificationQueue,
    // runNotificationQueue
};