const express = require('express');
const route = express.Router();
const transactionController = require('../controller/transaction.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

route.post('/add', authenticateJWT, transactionController.add);
route.put('/update/:id', authenticateJWT, transactionController.update);
route.post('/lists', authenticateJWT, transactionController.lists);
// route.get('/:id', authenticateJWT, transactionController.getById);
route.delete('/delete/:id', authenticateJWT, transactionController.delete);

module.exports = route;
