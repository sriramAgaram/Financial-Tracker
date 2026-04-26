import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { selectDashboardData } from './redux/homeSlice';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';
import { useAppSelector } from '../../hooks/useAppSelector';
import { addTransactionActions, homeDataActions } from './redux/homeSagas';
import { useExpenseTypes } from '../../hooks/useExpenseTypes';
import { Calendar } from 'primereact/calendar';
import { showToast } from '../../store/uiSlice';
import { format } from 'date-fns';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const amountData = useAppSelector(selectDashboardData);
  const expenseTypes = useExpenseTypes();
  const [data, setData] = useState({
    expences_type_id: 0,
    amount: 0,
    date: new Date(),
    transaction_type: 'DEBIT',
    notes: ''
  });

  useEffect(() => {
    dispatch(homeDataActions.request());
  }, [])

  const handleChange = (e: any) => {
    let name: string, value: any;

    if (e.target) {
      ({ name, value } = e.target);
    } else {
      name = e.name || 'expences_type_id';
      value = e.value;
    }

    setData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number.parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.expences_type_id && data.amount > 0 && data.date) {
      const currentBalance = amountData?.balanceDailyAmt || 0;
      if (data.transaction_type === 'DEBIT' && data.amount > currentBalance) {
        dispatch(showToast({
          severity: 'warn',
          summary: 'Daily Limit Exceeded',
          detail: 'This transaction exceeds your daily limit!',
          life: 4000
        }))
      }

      dispatch(addTransactionActions.request({
        expense_type_id: Number(data.expences_type_id),
        amount: data.amount,
        date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
        transaction_type: data.transaction_type,
        notes: data.notes
      }));
      setData({
        expences_type_id: 0,
        amount: 0,
        date: new Date(),
        transaction_type: 'DEBIT',
        notes: ''
      })
      dispatch(homeDataActions.request());
    }
  };

  // Comparison Logic for Card 2
  const expenseDiff = amountData?.prevMonthSum ? (amountData.currentExpense || 0) - amountData.prevMonthSum : 0;
  const isSpendingMore = expenseDiff > 0;

  return (
    <div className="bg-transparent text-slate-900 font-sans selection:bg-red-500/30">
      {/* Main Content */}
      <main className="pb-24 max-w-7xl mx-auto">
        
        {/* Stats Grid - Responsive (Row on Desktop, 2x2 on Mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          
          {/* Card 1: Monthly Income - GREEN */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl relative overflow-hidden group hover:border-emerald-600/30 hover:shadow-md transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                <TrendingUp size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Income</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-emerald-600 tracking-tight">₹{amountData?.currentIncome || 0}</div>
          </div>

          {/* Card 2: Spent This Month - Comparison Logic */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl relative overflow-hidden group hover:border-red-600/30 hover:shadow-md transition-all shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                <TrendingDown size={14} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Spent Month</span>
            </div>
            <div className="flex flex-col">
              <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">₹{amountData?.currentExpense || 0}</div>
              <div className="mt-1 text-[9px] font-medium text-slate-400">Last Month: ₹{amountData?.prevMonthSum || 0}</div>
              {amountData?.prevMonthSum !== undefined && (
                <div className={`mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex max-w-fit items-center gap-1 ${isSpendingMore ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                   {isSpendingMore ? <Plus size={8} /> : <span>-</span>}
                   ₹{Math.abs(expenseDiff).toLocaleString('en-IN')}
                   <span className="opacity-60 ml-0.5">{isSpendingMore ? '↑' : '↓'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Monthly Budget Remaining */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm hover:border-slate-300 transition-all">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
              <LayoutGrid size={14} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Monthly Rem</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-black tracking-tight">₹{amountData?.balanceMonthlyAmt || 0}</div>
            <div className="mt-1 text-[8px] font-medium text-slate-400">Limit: ₹{amountData?.monthlyLimit || 0}</div>
          </div>

          {/* Card 4: Money in Hand - Neutral */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl hover:shadow-md transition-all shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Wallet size={14} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">In Hand</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight">₹{amountData?.balanceOverallAmt || 0}</div>
            <div className="mt-1 text-[8px] font-medium text-slate-400">Daily Rem: <span className="text-red-500 font-bold">₹{amountData?.balanceDailyAmt || 0}</span></div>
          </div>
        </div>

        {/* Transaction Section */}
        <div className="max-w-md mx-auto">
          {/* Action Toggle (Debit / Credit) */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-4 border border-slate-200">
            <button 
              type="button" 
              onClick={() => setData(prev => ({ ...prev, transaction_type: 'DEBIT' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                data.transaction_type === 'DEBIT' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              DEBIT
            </button>
            <button 
              type="button" 
              onClick={() => setData(prev => ({ ...prev, transaction_type: 'CREDIT' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                data.transaction_type === 'CREDIT' 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              CREDIT
            </button>
          </div>

          {/* Add Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date</label>
                <div className="relative group">
                  <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none z-10" />
                  <Calendar 
                    value={data.date} 
                    onChange={(e: any) => handleChange({ target: { name: 'date', value: e.value } })} 
                    dateFormat="dd/mm/yy"
                    className="w-full custom-calendar" 
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                <Dropdown
                  name="expences_type_id"
                  value={data.expences_type_id}
                  onChange={handleChange}
                  options={(expenseTypes || []).filter((type: any) => (type.type || 'DEBIT') === data.transaction_type)}
                  optionLabel="expense_name"
                  optionValue="expense_type_id"
                  placeholder="Category"
                  dropdownIcon={<ChevronDown size={14} className="text-slate-400" />}
                  className="w-full h-12 bg-white border-slate-200 rounded-2xl flex items-center px-2 text-sm text-slate-900 shadow-sm"
                />
              </div>
            </div>

              {/* Notes Section */}
            <div className="space-y-2">
              <FloatLabel>
                <label htmlFor="notes" className="text-slate-400">Add some details...</label>
                <InputTextarea 
                  id="notes" 
                  value={data.notes} 
                  onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))} 
                  rows={3} 
                  autoResize
                  className="w-full bg-white border-slate-200 rounded-2xl p-4 text-sm text-slate-900 shadow-sm focus:border-slate-900 transition-all outline-none" 
                />
              </FloatLabel>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount</label>
              <div className="relative bg-white rounded-3xl group-focus-within:border-red-600/50 transition-all flex items-center">
                {/* <span className={`text-3xl font-bold mr-2 ${data.transaction_type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'}`}>₹</span> */}
                <InputNumber
                  value={data.amount || null}
                  onValueChange={(e) => setData(prev => ({ ...prev, amount: e.value || 0 }))}
                  placeholder="0.00"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  className="w-full"
                  inputClassName="bg-transparent border-none text-3xl font-bold w-full focus:ring-0 placeholder:text-slate-200 text-slate-900 text-right outline-none"
                />
              </div>
            </div>

            {/* Add Button */}
            <button
              type="submit"
              disabled={!data.expences_type_id || data.amount <= 0}
              className={`w-full h-16 rounded-3xl font-black text-sm uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-3 ${
                !data.expences_type_id || data.amount <= 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 text-white active:scale-95 shadow-xl shadow-slate-900/10'
              }`}
            >
              <Plus size={20} />
              ADD {data.transaction_type}
            </button>
          </form>
        </div>
      </main>

      {/* Styles to override PrimeReact defaults */}
      <style>{`
        .p-calendar .p-inputtext {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 1rem !important;
          color: #0f172a !important;
          height: 3rem !important;
          padding-left: 2.75rem !important;
          width: 100% !important;
          font-size: 0.875rem !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        .p-dropdown {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 1rem !important;
          color: #0f172a !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        .p-dropdown-label {
          color: #64748b !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          font-size: 0.875rem !important;
        }
        .p-dropdown-panel {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 1rem !important;
          overflow: hidden !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
        .p-datepicker {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          border-radius: 1rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
      `}</style>
    </div>
  )
}

export default HomePage

