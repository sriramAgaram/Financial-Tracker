const _ = require('lodash');

const getLedgerFields = (data) => {
    return _.pick(data, [
        'ledger_id',
        'user_id',
        'name',
        'is_default',
        'created_at'
    ]);
};

module.exports = {
    getLedgerFields
};
