const express = require('express');
const route = express.Router();
const userController = require('../controller/user.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

route.use(authenticateJWT);

route.get('/details', userController.getProfile);
route.put('/update', userController.updateProfile);
route.post('/send-otp', userController.sendVerificationOtp);
route.post('/verify-email', userController.verifyEmail);

module.exports = route;
