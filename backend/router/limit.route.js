const express = require('express');
const route = express.Router();
const limitController = require('../controller/limit.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
const validate = require('../middleware/validate');
const limitSchemas = require('../schemas/limit.schema');

route.use(authenticateJWT)

route.post('/add', validate(limitSchemas.add), limitController.add);
route.put('/update/:id', validate(limitSchemas.update), limitController.update);
route.get('/all', limitController.getAll);
route.get('/:id', limitController.getById);
// route.get('/user/:userId', authenticateJWT, limitController.getByUserId);
route.delete('/delete/:id', limitController.delete);

module.exports = route;
