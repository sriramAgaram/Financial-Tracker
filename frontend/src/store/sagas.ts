import { all, fork } from 'redux-saga/effects'
import authSagas from '../features/auth/redux/authSagas'
import homeSagas from '../features/home/redux/homeSagas'
import listSagas from '../features/list/redux/listSagas'
import settingsSagas from '../features/settings/redux/settingsSagas'

// Root saga that combines all feature sagas
function* rootSaga(): Generator {
  yield all([
    fork(authSagas),
    fork(homeSagas),
    fork(listSagas),
    fork(settingsSagas),
  ])
}

export default rootSaga
