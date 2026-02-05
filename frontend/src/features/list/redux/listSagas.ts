import { takeEvery } from "redux-saga/effects"
import { createApiActions } from "../../../store/utils/sagaUtils"
import { createApiWorker } from "../../../store/utils/apiWorker"
import apiClient from "../../../client/api.clinet";



export const listTransactionActions = createApiActions<{pageNumber:number,rows:number}, {pageNumber:number,rows:number}>('transaction/lists');
export const updateTransactionActions = createApiActions<{amount:number,expense_type_id:number,transaction_id:number}, {amount:number,expense_type_id:number,transaction_id:number}>('transaction/update');
export const deleteTransactionActions = createApiActions<{transaction_id:number}, {transaction_id:number}>('transaction/delete');


const getAllTransactions =async (payload:{pageNumber:number,rows:number}) =>{
  const response = await apiClient.post('/transaction/lists', payload);
  return response
}

const updateTransaction =async (payload:{amount:number,expense_type_id:number,transaction_id:number}) =>{
  const {transaction_id} = payload
  const response = await apiClient.put('/transaction/update/'+transaction_id, payload);
  return response
}

const deleteTransaction =async (payload:{transaction_id:number}) =>{
  const {transaction_id} = payload
  const response = await apiClient.delete('/transaction/delete/'+transaction_id);
  return response
}



const updateTransactionWorker = createApiWorker(updateTransactionActions, updateTransaction);
const listTransactionWorker = createApiWorker(listTransactionActions, getAllTransactions);
const deleteTransactionWorker = createApiWorker(deleteTransactionActions, deleteTransaction);


function* listWatcher() {
  yield takeEvery(listTransactionActions.types.REQUEST , listTransactionWorker)
  yield takeEvery(updateTransactionActions.types.REQUEST , updateTransactionWorker)
  yield takeEvery(deleteTransactionActions.types.REQUEST , deleteTransactionWorker)
}

export default listWatcher
