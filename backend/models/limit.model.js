const _ = require('lodash');

exports.getLimitForCreate = (fields) => {
    return _.pick(fields, [
        'user_id',
        'monthly_limit',
        'daily_limit',
        'overall_amount'
    ]);
};

exports.getLimitForUpdate = (fields) => {
    return _.pick(fields, [
        'monthly_limit',
        'daily_limit',
        'overall_amount'
    ]);
};
