const _ = require('lodash');

const getLedgerFieldsForCreate = (data) => {
    return _.pick(data, [
        'user_id',
        'name',
        'is_default'
    ]);
};

const getLedgerFieldsForUpdate = (data) => {
    return _.pick(data, [
        'name',
        'is_default'
    ]);
};

module.exports = {
    getLedgerFieldsForCreate,
    getLedgerFieldsForUpdate
};
