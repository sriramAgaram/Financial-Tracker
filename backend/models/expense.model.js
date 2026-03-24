const _ = require('lodash');

exports.getExpenseTypeForCreate = (fields) => {
    return _.pick(fields, [
        'expense_name',
        'ledger_id',
        'user_id',
        'type'
    ]);
};

exports.getExpenseTypeForUpdate = (fields) => {
    return _.pick(fields, [
        'expense_name',
        'ledger_id',
        'type'
    ]);
};
