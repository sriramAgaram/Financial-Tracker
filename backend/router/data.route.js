const express = require('express');
const route = express.Router();
const settingsController = require('../controller/data.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

// Get settings data for authenticated user (user_id from JWT)
route.get('/settingdata', authenticateJWT, settingsController.getSettingsData);
route.get('/homedata', authenticateJWT, settingsController.homedata)
module.exports = route;
