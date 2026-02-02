import { takeEvery } from "redux-saga/effects"
import { createApiActions } from "../../../store/utils/sagaUtils"
import { createApiWorker } from "../../../store/utils/apiWorker"
import apiClient from "../../../client/api.clinet";



export const listTransactionActions = createApiActions<{pageNumber:number,rows:number}, {pageNumber:number,rows:number}>('transaction/lists');


const getAllTransactions =async (payload:{pageNumber:number,rows:number}) =>{
  const response = await apiClient.post('/transaction/lists', payload);
  return response
}


const listTransactionWorker = createApiWorker(listTransactionActions, getAllTransactions)

// Watcher saga
function* listWatcher() {
  yield takeEvery(listTransactionActions.types.REQUEST , listTransactionWorker)
}

export default listWatcher
