import { takeEvery } from 'redux-saga/effects'
import apiClient from '../../../client/api.clinet'
import { createApiActions } from '../../../store/utils/sagaUtils'
import { createApiWorker } from '../../../store/utils/apiWorker'

interface HomedataResponse {
  balanceDailyAmt: number
  balanceMonthlyAmt: number
}
export const homeDataActions = createApiActions<void, HomedataResponse>('home/homeData');
export const expenseTypeActions = createApiActions<void, any[]>('home/expenseType');
export const addTransactionActions = createApiActions<{ expense_type_id: number, amount: number }, void>('home/addTransaction');
export const addExpenseTypeActions = createApiActions<{ expense_name: string }, void>('home/addExpenseType');
export const updateExpenseTypeActions = createApiActions<{ id: number, name: string }, void>('home/updateExpenseType');
export const deleteExpenseTypeActions = createApiActions<number, void>('home/deleteExpenseType');
const homeDataApi = async () => {
  const response = await apiClient.get('/data/homedata')
  return response.data
}

const expenseType = async() =>{
  const response = await apiClient.get('/expencestype/lists')
  return response.data
}

const addTransactionApi =  async (data: { expense_type_id: number, amount: number }) =>{
  const response = await apiClient.post('/transaction/add',data)
  return response.data
}

// Expense Type Management APIs
const addExpenseTypeApi = async (data: { expense_name: string }) => {
  const response = await apiClient.post('/expencestype/add', data);
  return response.data;
}

const updateExpenseTypeApi = async (data: { id: number, name: string }) => {
  const response = await apiClient.put(`/expencestype/update/${data.id}`, { expense_name: data.name });
  return response.data;
}

const deleteExpenseTypeApi = async (id: number) => {
  const response = await apiClient.delete(`/expencestype/delete/${id}`);
  return response.data;
}

const homeDataWorker = createApiWorker(homeDataActions, homeDataApi);
const expenseTypeWorker = createApiWorker(expenseTypeActions, expenseType)
const addTransactionWorker = createApiWorker(addTransactionActions, addTransactionApi)
const addExpenseTypeWorker = createApiWorker(addExpenseTypeActions, addExpenseTypeApi, undefined, () => expenseTypeActions.request());
const updateExpenseTypeWorker = createApiWorker(updateExpenseTypeActions, updateExpenseTypeApi, undefined, () => expenseTypeActions.request());
const deleteExpenseTypeWorker = createApiWorker(deleteExpenseTypeActions, deleteExpenseTypeApi, undefined, () => expenseTypeActions.request());

function* homeWatcher() {
  yield takeEvery(addTransactionActions.types.REQUEST, addTransactionWorker)
  yield takeEvery(expenseTypeActions.types.REQUEST, expenseTypeWorker)
  yield takeEvery(homeDataActions.types.REQUEST, homeDataWorker)
  yield takeEvery(addExpenseTypeActions.types.REQUEST, addExpenseTypeWorker)
  yield takeEvery(updateExpenseTypeActions.types.REQUEST, updateExpenseTypeWorker)
  yield takeEvery(deleteExpenseTypeActions.types.REQUEST, deleteExpenseTypeWorker)
}

export default homeWatcher
