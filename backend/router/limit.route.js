const express = require('express');
const route = express.Router();
const limitController = require('../controller/limit.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

route.post('/add', authenticateJWT, limitController.add);
route.put('/update/:id', authenticateJWT, limitController.update);
route.get('/all', authenticateJWT, limitController.getAll);
route.get('/:id', authenticateJWT, limitController.getById);
// route.get('/user/:userId', authenticateJWT, limitController.getByUserId);
route.delete('/delete/:id', authenticateJWT, limitController.delete);

module.exports = route;
