import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveLedger } from '../redux/ledgerSlice';
import { listLedgerActions, addLedgerActions } from '../redux/ledgerSagas';
import { selectLedgers, selectActiveLedgerId, selectIsLedgerLoading } from '../redux/ledgerSelectors';

const LedgerSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const ledgers = useSelector(selectLedgers);
  const activeLedgerId = useSelector(selectActiveLedgerId);
  const loading = useSelector(selectIsLedgerLoading);

  const [displayDialog, setDisplayDialog] = useState(false);
  const [newLedgerName, setNewLedgerName] = useState('');

  useEffect(() => {
    dispatch(listLedgerActions.request());
  }, [dispatch]);

  const onLedgerChange = (e: { value: number }) => {
    dispatch(setActiveLedger(e.value));
    // Trigger a reload of data for the new ledger
    globalThis.window.location.reload(); 
  };

  const handleAddLedger = () => {
    if (newLedgerName.trim()) {
      dispatch(addLedgerActions.request({ name: newLedgerName }));
      setNewLedgerName('');
      setDisplayDialog(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 mt-4">
      <Button label="Cancel" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text p-button-secondary" />
      <Button label="Create" icon="pi pi-check" onClick={handleAddLedger} autoFocus className="p-button-primary px-4" />
    </div>
  );

  return (
    <div className="flex items-center gap-2">
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
          className="w-40 h-10 flex items-center bg-white border-slate-200 text-sm shadow-sm hover:border-slate-300 transition-colors"
        />
      </div>

      <Button
        icon="pi pi-plus"
        onClick={() => setDisplayDialog(true)}
        className="p-button-rounded p-button-text p-button-sm text-slate-600 hover:bg-slate-100 h-10 w-10"
        tooltip="Create New Ledger"
        tooltipOptions={{ position: 'bottom' }}
      />

      <Dialog
        header="Create New Ledger"
        visible={displayDialog}
        style={{ width: '90vw', maxWidth: '400px' }}
        onHide={() => setDisplayDialog(false)}
        footer={dialogFooter}
        className="rounded-xl shadow-2xl"
        draggable={false}
        resizable={false}
      >
        <div className="flex flex-col gap-2 mt-2">
          <label htmlFor="ledgerName" className="text-sm font-medium text-slate-600">
            Ledger Name
          </label>
          <InputText
            id="ledgerName"
            value={newLedgerName}
            onChange={(e) => setNewLedgerName(e.target.value)}
            placeholder="e.g., Business, Travel, Personal"
            className="w-full p-inputtext-sm border-slate-200 focus:border-blue-500 transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddLedger();
            }}
          />
          <small className="text-slate-400">
            Use different ledgers to separate your expenses.
          </small>
        </div>
      </Dialog>
    </div>
  );
};

export default LedgerSwitcher;
