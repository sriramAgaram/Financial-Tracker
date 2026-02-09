const express = require('express');
const route = express.Router();
const transactionController = require('../controller/transaction.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
route.use(authenticateJWT)
route.post('/add', transactionController.add);
route.put('/update/:id', transactionController.update);
route.post('/lists', transactionController.lists);
// route.get('/:id', transactionController.getById);
route.delete('/delete/:id', transactionController.delete);
route.post('/weeklydata', transactionController.weeklyData);

module.exports = route;
