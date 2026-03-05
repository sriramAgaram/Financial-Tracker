const express = require('express');
const route = express.Router();
const ledgerController = require('../controller/ledger.controller');
const { authenticateJWT } = require('../utils/jwt/jwt');
const validate = require('../middleware/validate');
const ledgerSchemas = require('../schemas/ledger.schema');

route.use(authenticateJWT)

route.post('/add', validate(ledgerSchemas.add), ledgerController.add);
route.put('/update/:id', validate(ledgerSchemas.update), ledgerController.update);
route.get('/lists', ledgerController.lists);
route.delete('/delete/:id', ledgerController.delete);

module.exports = route;
