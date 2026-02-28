import type { RootState } from "../../../store";

export const selectLedgers = (state: RootState) => state.ledger.ledgers;
export const selectActiveLedgerId = (state: RootState) => state.ledger.activeLedgerId;
export const selectActiveLedger = (state: RootState) => 
  state.ledger.ledgers.find(l => l.ledger_id === state.ledger.activeLedgerId);
export const selectIsLedgerLoading = (state: RootState) => state.ledger.loading;
export const selectLedgerError = (state: RootState) => state.ledger.error;
