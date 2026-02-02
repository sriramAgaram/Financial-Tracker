const _ = require('lodash');

exports.getExpenseTypeForCreate = (fields) => {
    return _.pick(fields, [
        'expense_name',
        'user_id'
    ]);
};

exports.getExpenseTypeForUpdate = (fields) => {
    return _.pick(fields, [
        'expense_name'
    ]);
};
