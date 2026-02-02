const express = require('express');
const route = express.Router();
const expencestypeController = require('../controller/expencestype.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');

route.post('/add', authenticateJWT, expencestypeController.add);
route.put('/update/:id', authenticateJWT, expencestypeController.update);
route.get('/lists', authenticateJWT, expencestypeController.lists);
// route.get('/:id', authenticateJWT, expencestypeController.getById);
route.delete('/delete/:id', authenticateJWT, expencestypeController.delete);

module.exports = route;
