const lodash = require('lodash');


exports.getTransactionFields = (fields) =>{
  return lodash.pick(fields , [
    'user_id',
    'expense_type_id',
    'amount',
    'date'
   ])
}

