const lodash = require('lodash');


exports.getTransactionFields = (fields) =>{
  return lodash.pick(fields , [
    'user_id',
    'ledger_id',
    'expense_type_id',
    'amount',
    'date',
    'transaction_type',
    'notes'
   ])
}

