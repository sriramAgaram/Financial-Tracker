import React, { useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveLedger } from '../redux/ledgerSlice';
import { listLedgerActions } from '../redux/ledgerSagas';
import { selectLedgers, selectActiveLedgerId, selectIsLedgerLoading } from '../redux/ledgerSelectors';

const LedgerSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const ledgers = useSelector(selectLedgers);
  const activeLedgerId = useSelector(selectActiveLedgerId);
  const loading = useSelector(selectIsLedgerLoading);

  useEffect(() => {
    dispatch(listLedgerActions.request());
  }, [dispatch]);

  const onLedgerChange = (e: { value: number }) => {
    dispatch(setActiveLedger(e.value));
    // Trigger a reload of data for the new ledger
    globalThis.window.location.reload(); 
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline text-sm font-medium text-slate-500">Ledger:</span>
      <Dropdown
        value={activeLedgerId}
        options={ledgers}
        onChange={onLedgerChange}
        optionLabel="name"
        optionValue="ledger_id"
        placeholder="Select Ledger"
        loading={loading}
        className="w-40 h-9 flex items-center bg-white border-slate-200 text-sm"
      />
    </div>
  );
};

export default LedgerSwitcher;
