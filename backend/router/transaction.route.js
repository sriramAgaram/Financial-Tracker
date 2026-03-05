const express = require('express');
const route = express.Router();
const transactionController = require('../controller/transaction.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
const validate = require('../middleware/validate');
const transactionSchemas = require('../schemas/transaction.schema');

route.use(authenticateJWT)

route.post('/add', validate(transactionSchemas.add), transactionController.add);
route.put('/update/:id', validate(transactionSchemas.update), transactionController.update);
route.post('/lists', validate(transactionSchemas.lists), transactionController.lists);
// route.get('/:id', transactionController.getById);
route.delete('/delete/:id', transactionController.delete);
route.post('/weeklydata', transactionController.weeklyData);

module.exports = route;
