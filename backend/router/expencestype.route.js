const express = require('express');
const route = express.Router();
const expencestypeController = require('../controller/expencestype.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
const validate = require('../middleware/validate');
const expenseTypeSchemas = require('../schemas/expencestype.schema');

route.use(authenticateJWT)

route.post('/add', validate(expenseTypeSchemas.add), expencestypeController.add);
route.put('/update/:id', validate(expenseTypeSchemas.update), expencestypeController.update);
route.get('/lists', expencestypeController.lists);
// route.get('/:id', authenticateJWT, expencestypeController.getById);
route.delete('/delete/:id', expencestypeController.delete);

module.exports = route;
