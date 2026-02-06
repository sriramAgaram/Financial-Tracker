const express = require('express');
const route = express.Router();
const limitController = require('../controller/limit.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
route.use(authenticateJWT)

route.post('/add', limitController.add);
route.put('/update/:id', limitController.update);
route.get('/all', limitController.getAll);
route.get('/:id', limitController.getById);
// route.get('/user/:userId', authenticateJWT, limitController.getByUserId);
route.delete('/delete/:id', limitController.delete);

module.exports = route;
