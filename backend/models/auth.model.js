const lodash = require('lodash');


exports.getAuthFields = (fields) =>{
  return lodash.pick(fields , [
    'name',
    'username',
    'email'
   ])
}

