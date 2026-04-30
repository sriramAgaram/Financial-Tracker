import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listLedgerActions, addLedgerActions, type Ledger } from './ledgerSagas';

interface LedgerState {
  ledgers: Ledger[];
  activeLedgerId: number | null;
  loading: boolean;
  error: string | null;
  createSuccess: boolean;
}

const initialState: LedgerState = {
  ledgers: [],
  activeLedgerId: localStorage.getItem('activeLedgerId') ? parseInt(localStorage.getItem('activeLedgerId')!) : null,
  loading: false,
  error: null,
  createSuccess: false,
};

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    setActiveLedger: (state, action: PayloadAction<number>) => {
      state.activeLedgerId = action.payload;
      localStorage.setItem('activeLedgerId', action.payload.toString());
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listLedgerActions.types.REQUEST, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(listLedgerActions.types.SUCCESS, (state, action: PayloadAction<Ledger[]>) => {
      state.loading = false;
      state.ledgers = action.payload;
      const activeExists = action.payload.some(l => Number(l.ledger_id) === Number(state.activeLedgerId));
      if ((!state.activeLedgerId || !activeExists) && action.payload.length > 0) {
        const defaultLedger = action.payload.find(l => l.is_default) || action.payload[0];
        state.activeLedgerId = defaultLedger.ledger_id;
        localStorage.setItem('activeLedgerId', defaultLedger.ledger_id.toString());
      }
    });
    builder.addCase(listLedgerActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    });
    
    builder.addCase(addLedgerActions.types.REQUEST, (state) => {
      state.loading = true;
      state.createSuccess = false;
    });
    builder.addCase(addLedgerActions.types.SUCCESS, (state, action: PayloadAction<Ledger[] | Ledger>) => {
      state.loading = false;
      state.createSuccess = true;
      // Handle both array and single object based on backend response pattern
      const newLedger = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      if (newLedger) {
        state.ledgers.push(newLedger);
      }
    });
    builder.addCase(addLedgerActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.createSuccess = false;
    });
  },
});

export const { setActiveLedger } = ledgerSlice.actions;

export default ledgerSlice.reducer;
