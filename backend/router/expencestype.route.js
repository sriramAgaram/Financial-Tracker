const express = require('express');
const route = express.Router();
const expencestypeController = require('../controller/expencestype.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
route.use(authenticateJWT)

route.post('/add', expencestypeController.add);
route.put('/update/:id', expencestypeController.update);
route.get('/lists', expencestypeController.lists);
// route.get('/:id', authenticateJWT, expencestypeController.getById);
route.delete('/delete/:id', expencestypeController.delete);

module.exports = route;
