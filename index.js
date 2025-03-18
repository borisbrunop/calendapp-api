const express = require("express");
const dotEnv = require("dotenv").config();
var bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const { runNotificationQueue, notificationQueue } = require("./utils/BullIoRedis");
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require("@bull-board/api");
const basicAuth = require('express-basic-auth');

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(cors());
app.use(morgan('dev'));

//RUN BULL IO REDIS PROCESS FOR NOTIFICATIONS
runNotificationQueue()

const admin_users = {
  [process.env.BULL_USER]: process.env.BULL_PASSWORD
};

const authMiddleware = basicAuth({
  users: admin_users,
  challenge: true, // Show login dialog
  realm: 'Bull Board' 
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(notificationQueue)],
  serverAdapter: serverAdapter,
});

const users = require("./routes/users.route");
const user = require("./routes/user.route");
const quote_type = require("./routes/quote_type.route");
const quote_time = require("./routes/quote_times.route");
const quote = require("./routes/quote.route");
const patients = require("./routes/patients.route");
const categories = require("./routes/categories.route");
const providers = require("./routes/providers.route");
const notifications = require("./routes/notifications.route");

app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());
app.use("/api/v1/users", users);
app.use("/api/v1/user", user);
app.use("/api/v1/config/quote", quote_type);
app.use("/api/v1/config/quote_time", quote_time);
app.use("/api/v1/quote", quote);
app.use("/api/v1/quote/type", quote);
app.use("/api/v1/patients", patients);
app.use("/api/v1/categories", categories);
app.use("/api/v1/providers", providers);
app.use("/api/v1/notifications", notifications);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
