const express = require('express');
const route = express.Router();
const authController = require('../controller/auth.controller')
const validate = require('../middleware/validate');
const authSchemas = require('../schemas/auth.schema');

route.post('/signup/initiate', validate(authSchemas.initiateSignup), authController.initiateSignup);
route.post('/signup/verify', validate(authSchemas.verifyOtp), authController.verifyOtp);
route.post('/signup/complete', validate(authSchemas.completeSignup), authController.completeSignup);
route.post('/login', validate(authSchemas.login), authController.login);

module.exports = route;