import { takeEvery } from "redux-saga/effects"
import { createApiActions } from "../../../store/utils/sagaUtils"
import { createApiWorker } from "../../../store/utils/apiWorker"
import apiClient from "../../../client/api.clinet";

export interface Ledger {
  ledger_id: number;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

// 1. Define Actions
export const listLedgerActions = createApiActions<void, Ledger[]>('ledger/lists');
export const addLedgerActions = createApiActions<{ name: string }, Ledger>('ledger/add');
export const updateLedgerActions = createApiActions<{ id: number, name: string, is_default?: boolean }, Ledger>('ledger/update');
export const deleteLedgerActions = createApiActions<number, void>('ledger/delete');

// 2. Define API Calls
const fetchLedgersApi = async () => {
    const response = await apiClient.get('/ledger/lists');
    return response.data;
}

const addLedgerApi = async (payload: { name: string }) => {
    const response = await apiClient.post('/ledger/add', payload);
    return response.data;
}

const updateLedgerApi = async (payload: { id: number, name: string, is_default?: boolean }) => {
    const { id, ...data } = payload;
    const response = await apiClient.put(`/ledger/update/${id}`, data);
    return response.data;
}

const deleteLedgerApi = async (id: number) => {
    const response = await apiClient.delete(`/ledger/delete/${id}`);
    return response.data;
}

// 3. Create Workers
const listLedgerWorker = createApiWorker(listLedgerActions, fetchLedgersApi);
const addLedgerWorker = createApiWorker(addLedgerActions, addLedgerApi, undefined, undefined, 'Ledger Created');
const updateLedgerWorker = createApiWorker(updateLedgerActions, updateLedgerApi, undefined, undefined, 'Ledger Updated');
const deleteLedgerWorker = createApiWorker(deleteLedgerActions, deleteLedgerApi, undefined, undefined, 'Ledger Deleted');

// 4. Create Watcher
function* ledgerWatcher() {
    yield takeEvery(listLedgerActions.types.REQUEST, listLedgerWorker);
    yield takeEvery(addLedgerActions.types.REQUEST, addLedgerWorker);
    yield takeEvery(updateLedgerActions.types.REQUEST, updateLedgerWorker);
    yield takeEvery(deleteLedgerActions.types.REQUEST, deleteLedgerWorker);
}

export default ledgerWatcher;
