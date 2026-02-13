
import { takeEvery } from 'redux-saga/effects'
import apiClient from '../../../client/api.clinet'
import { createApiActions } from '../../../store/utils/sagaUtils'
import { createApiWorker } from '../../../store/utils/apiWorker'

// types
export interface WeeklyDataPayload {
    fromDate: string;
    toDate: string;
}

export interface WeeklyDataResponse {
    chartData: number[]; // [12, 10, 3, 5, 2, 3, 10]
    labels: string[];     // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    totalAmount: number;
    overExpenseChartData: number[];
    overExpenseLabels: string[];
    }

// 1. Define Actions
export const weeklyDataActions = createApiActions<WeeklyDataPayload, WeeklyDataResponse>('dashboard/weeklyData');


// 2. Define API Call
const weeklyDataApi = async (payload: WeeklyDataPayload) => {
    const response = await apiClient.post('/transaction/weeklydata', payload);
    return response.data;
}

// 3. Create Worker
const weeklyDataWorker = createApiWorker(weeklyDataActions, weeklyDataApi);


// 4. Create Watcher
function* dashboardWatcher() {
    yield takeEvery(weeklyDataActions.types.REQUEST, weeklyDataWorker);
}

export default dashboardWatcher;
