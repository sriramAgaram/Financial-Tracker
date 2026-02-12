import { takeEvery } from 'redux-saga/effects'
import apiClient from '../../../client/api.clinet'
import { createApiActions } from '../../../store/utils/sagaUtils'
import { createApiWorker } from '../../../store/utils/apiWorker'

interface UpdateLimitPayload {
  daily_limit: number
  monthly_limit: number
  id: number
}

export const LimitFetchActions = createApiActions<void, any[]>('settings/settingsFetch')
export const settingsUpdateActions = createApiActions<UpdateLimitPayload, any>('settings/settingsUpdate')


const fetchLimitApi = async () => {
  const response = await apiClient.get('/limit/all')
  return response.data
}

const updateLimitApi = async (payload: UpdateLimitPayload) => {
  const { id, ...updateData } = payload 
  const response = await apiClient.put(`/limit/update/${id}`, updateData)
  return response.data
}



const fetchLimitWorker = createApiWorker(LimitFetchActions, fetchLimitApi)
const updateLimitWorker = createApiWorker(settingsUpdateActions, updateLimitApi, undefined, () => LimitFetchActions.request(), 'Settings Saved!')

function* settingsWatcher() {
  yield takeEvery(LimitFetchActions.types.REQUEST, fetchLimitWorker)
  yield takeEvery(settingsUpdateActions.types.REQUEST, updateLimitWorker)
}

export default settingsWatcher
