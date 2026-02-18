const express = require('express');
const route = express.Router();
const authController = require('../controller/auth.controller')

route.post('/signup/initiate', authController.initiateSignup);
route.post('/signup/verify', authController.verifyOtp);
route.post('/signup/complete', authController.completeSignup);
route.post('/login', authController.login);

module.exports = route;