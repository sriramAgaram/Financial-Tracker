import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
    severity: 'success' | 'info' | 'warn' | 'error';
    summary: string;
    detail?: string;
    life?: number;
}

interface UIState {
    toast: ToastState | null;
}

const initialState: UIState = {
    toast: null
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showToast: (state, action: PayloadAction<ToastState>) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        }
    }
});

export const { showToast, hideToast } = uiSlice.actions;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;

export default uiSlice.reducer;
