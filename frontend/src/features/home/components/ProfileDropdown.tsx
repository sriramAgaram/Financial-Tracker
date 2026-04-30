import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, LogOut, Wallet, Plus, ChevronRight, Check } from 'lucide-react';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import { selectLedgers, selectActiveLedgerId } from '../../ledger/redux/ledgerSelectors';
import { setActiveLedger } from '../../ledger/redux/ledgerSlice';
import { listLedgerActions, addLedgerActions } from '../../ledger/redux/ledgerSagas';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const ledgers = useSelector(selectLedgers);
  const activeLedgerId = useSelector(selectActiveLedgerId);
  
  const [showLedgers, setShowLedgers] = useState(false);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [newLedgerName, setNewLedgerName] = useState('');

  useEffect(() => {
    dispatch(listLedgerActions.request());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the Dialog
      const isDialogClick = (event.target as Element)?.closest('.p-dialog');
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !isDialogClick) {
        onClose();
        setShowLedgers(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLedgerChange = (id: number) => {
    dispatch(setActiveLedger(id));
    onClose();
    window.location.reload();
  };

  const handleAddLedger = () => {
    if (newLedgerName.trim()) {
      dispatch(addLedgerActions.request({ name: newLedgerName }));
      setNewLedgerName('');
      setDisplayDialog(false);
      setShowLedgers(false);
      onClose();
    }
  };

  const handleLogout = () => {
    onClose();
    confirmDialog({
      message: 'Are you sure you want to sign out?',
      header: 'Sign Out Confirmation',
      icon: 'pi pi-power-off',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Sign Out',
      rejectLabel: 'Cancel',
      accept: () => {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  const dialogFooter = (
    <div className="flex justify-end gap-2 mt-4 pb-2">
      <Button 
        label="Cancel" 
        onClick={() => setDisplayDialog(false)} 
        className="p-button-text p-button-secondary text-sm font-bold" 
      />
      <Button 
        label="Create Ledger" 
        onClick={handleAddLedger} 
        className="bg-red-600 border-none text-white px-6 rounded-xl text-sm font-bold active:scale-95 transition-all" 
      />
    </div>
  );

  return (
    <>
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-14 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="py-2">
          {!showLedgers ? (
            <>
              <button
                onClick={() => setShowLedgers(true)}
                className="w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                    <Wallet size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Ledger</span>
                    <span className="text-sm font-bold truncate max-w-[120px]">
                      {ledgers.find(l => Number(l.ledger_id) === Number(activeLedgerId))?.name || 'Select Ledger'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <div className="h-px bg-slate-100 my-1 mx-4" />

              <button
                onClick={() => { navigate('/profile'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <User size={18} className="text-slate-400" />
                <span className="text-sm font-medium">Profile</span>
              </button>

              <button
                onClick={() => { navigate('/settings'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <Settings size={18} className="text-slate-400" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              
              <div className="h-px bg-slate-100 my-1 mx-4" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut size={18} />
                <span className="text-sm font-bold">Logout</span>
              </button>
            </>
          ) : (
            <div className="animate-in slide-in-from-right-2 duration-200">
              <div className="px-4 py-2 flex items-center justify-between">
                <button 
                  onClick={() => setShowLedgers(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1"
                >
                  BACK
                </button>
                <button 
                  onClick={() => setDisplayDialog(true)}
                  className="p-1 px-2 hover:bg-red-50 rounded-lg text-red-600 flex items-center gap-1 text-[10px] font-black"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {ledgers.map((ledger) => (
                  <button
                    key={ledger.ledger_id}
                    onClick={() => handleLedgerChange(ledger.ledger_id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className={`text-sm ${Number(ledger.ledger_id) === Number(activeLedgerId) ? 'font-bold text-red-600' : 'text-slate-700'}`}>
                      {ledger.name}
                    </span>
                    {Number(ledger.ledger_id) === Number(activeLedgerId) && <Check size={16} className="text-red-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        header="Create New Ledger"
        visible={displayDialog}
        style={{ width: '90vw', maxWidth: '400px' }}
        onHide={() => setDisplayDialog(false)}
        footer={dialogFooter}
        className="rounded-3xl shadow-2xl p-0 overflow-hidden"
        draggable={false}
        resizable={false}
        pt={{
          root: { className: 'border-none' },
          header: { className: 'bg-white pt-6 px-6 text-slate-900 border-none rounded-t-3xl font-bold' },
          content: { className: 'bg-white px-6 pb-2 border-none' },
          footer: { className: 'bg-white px-6 pb-6 border-none rounded-b-3xl' },
          mask: { className: 'backdrop-blur-sm bg-slate-900/40' }
        }}
      >
        <div className="flex flex-col gap-3 mt-2">
          <label htmlFor="ledgerName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Name your Ledger
          </label>
          <InputText
            id="ledgerName"
            value={newLedgerName}
            onChange={(e) => setNewLedgerName(e.target.value)}
            placeholder="e.g., Business, Travel, Personal"
            className="w-full h-14 bg-slate-50 border-slate-200 rounded-2xl px-4 text-sm focus:border-red-600/50 transition-all outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddLedger();
            }}
          />
          <p className="text-[10px] text-slate-400 leading-relaxed px-1">
            Separate your tracking by creating multiple ledgers for different use cases.
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;

