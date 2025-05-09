// filepath: /Users/borisbrunop/Desktop/DEVELOP/native/calendapi/worker.js
const { runNotificationQueue } = require('./utils/BullIoRedis');

// Start the Bull queue worker
runNotificationQueue();

console.log('Worker process started for notification queue.');