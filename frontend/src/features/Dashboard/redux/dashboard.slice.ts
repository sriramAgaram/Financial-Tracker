
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { weeklyDataActions, type WeeklyDataResponse } from './dashboard.saga';

// Define the state interface
interface DashboardState {
    weeklyData: WeeklyDataResponse | null;
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: DashboardState = {
    weeklyData: null,
    isLoading: false,
    error: null,
};

// Create the slice
const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(weeklyDataActions.types.REQUEST, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(weeklyDataActions.types.SUCCESS, (state, action: PayloadAction<WeeklyDataResponse>) => {
                state.isLoading = false;
                state.weeklyData = action.payload;
                state.error = null;
            })
            .addCase(weeklyDataActions.types.FAILURE, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Export reducer
export default dashboardSlice.reducer;

// Selectors
export const selectWeeklyData = (state: { dashboard: DashboardState }) => state.dashboard.weeklyData;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
