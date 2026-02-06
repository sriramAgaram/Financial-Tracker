const express = require('express');
const route = express.Router();
const settingsController = require('../controller/data.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

route.use(authenticateJWT)

// Get settings data for authenticated user (user_id from JWT)
route.get('/settingdata', settingsController.getSettingsData);
route.get('/homedata', settingsController.homedata)
module.exports = route;
