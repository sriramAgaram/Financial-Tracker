const express = require('express');
const route = express.Router();
const reportController = require('../controller/report.controller');
const cronMiddleware = require('../middleware/cron.middleware');

route.use(cronMiddleware);

route.post('/trigger-weekly-report', reportController.sendWeeklyReportToAll);

module.exports = route;
