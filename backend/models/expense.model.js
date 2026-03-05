const _ = require('lodash');

exports.getExpenseTypeForCreate = (fields) => {
    return _.pick(fields, [
        'expense_name',
        'ledger_id',
        'user_id'
    ]);
};

exports.getExpenseTypeForUpdate = (fields) => {
    return _.pick(fields, [
        'expense_name',
        'ledger_id'
    ]);
};
