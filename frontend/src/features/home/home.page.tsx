import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { selectDashboardData } from './redux/homeSlice';
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useAppSelector } from '../../hooks/useAppSelector';
import { addTransactionActions, homeDataActions } from './redux/homeSagas';
import { useExpenseTypes } from '../../hooks/useExpenseTypes';
import { Calendar } from 'primereact/calendar';
import { showToast } from '../../store/uiSlice';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const amountData = useAppSelector(selectDashboardData);
  const expenseTypes = useExpenseTypes();
  const [data, setData] = useState({
    expences_type_id: null,
    amount: 0,
    date: new Date(),
    transaction_type: 'DEBIT'
  });

  useEffect(() => {
    dispatch(homeDataActions.request())
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
        expense_type_id: data.expences_type_id,
        amount: data.amount,
        date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
        transaction_type: data.transaction_type
      }));
      setData({
        expences_type_id: null,
        amount: 0,
        date: new Date(),
        transaction_type: 'DEBIT'
      })
      dispatch(homeDataActions.request());
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-heading mb-4">Welcome to the Home Page</h1>
      <p className="text-body mb-6">
        This is the main dashboard where you can see an overview of your financial data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Spent This Month</h2>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-slate-800">₹{amountData?.currentExpense || 0}</p>
            {amountData?.prevMonthSum !== undefined && (
              <span className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg mb-1 ${
                ((amountData.currentExpense || 0) > amountData.prevMonthSum) ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
              }`}>
                <i className={`pi pi-arrow-${((amountData.currentExpense || 0) > amountData.prevMonthSum) ? 'up' : 'down'} text-[12px]`}></i>
                {Math.abs((amountData.currentExpense || 0) - amountData.prevMonthSum).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            vs ₹{(amountData?.prevMonthSum || 0).toLocaleString('en-IN')} last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Income This Month</h2>
          <p className="text-3xl font-bold text-emerald-600">₹{amountData?.currentIncome || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Daily Budget Rem.</h2>
          <p className="text-3xl font-bold text-fg-brand">₹{amountData?.balanceDailyAmt}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Monthly Budget Rem.</h2>
          <p className="text-3xl font-bold text-fg-danger">₹{amountData?.balanceMonthlyAmt}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Money in Hand</h2>
          <p className="text-3xl font-bold text-fg-success">₹{amountData?.balanceOverallAmt}</p>
        </div>
      </div>

      <div className='flex w-full justify-center items-center pt-20'>
        <form onSubmit={handleSubmit} className="flex flex-col gap-9 w-full max-w-sm">
          <div className="flex justify-center gap-4">
            <Button 
              type="button" 
              label="Debit (Expense)" 
              icon="pi pi-minus" 
              onClick={() => setData(prev => ({ ...prev, transaction_type: 'DEBIT' }))}
              className={`p-button-sm ${data.transaction_type === 'DEBIT' ? 'p-button-danger' : 'p-button-outlined p-button-secondary'}`}
            />
            <Button 
              type="button" 
              label="Credit (Income)" 
              icon="pi pi-plus" 
              onClick={() => setData(prev => ({ ...prev, transaction_type: 'CREDIT' }))}
              className={`p-button-sm ${data.transaction_type === 'CREDIT' ? 'p-button-success' : 'p-button-outlined p-button-secondary'}`}
            />
          </div>

          <Calendar value={data.date} onChange={(e: any) => handleChange({ target: { name: 'date', value: e.value } })} dateFormat="dd/mm/yy" />

          <div>
            <FloatLabel>
              <InputText
                id="amount"
                name="amount"
                value={data.amount.toString()}
                onChange={handleChange}
                className="w-full"
                keyfilter="num"
              />
              <label htmlFor="amount">Amount (₹)</label>
            </FloatLabel>
          </div>

          <div>
            <Dropdown
              name="expences_type_id"
              value={data.expences_type_id}
              onChange={handleChange}
              options={(expenseTypes || []).filter((type: any) => (type.type || 'DEBIT') === data.transaction_type)}
              optionLabel="expense_name"
              optionValue="expense_type_id"
              placeholder={`Select ${data.transaction_type === 'CREDIT' ? 'Income' : 'Expense'} Category`}
              className="w-full"
              showClear
            />
          </div>

          <Button
            type="submit"
            label={data.transaction_type === 'CREDIT' ? 'Add Income' : 'Add Expense'}
            icon="pi pi-plus"
            className={`w-full mt-2 ${data.transaction_type === 'CREDIT' ? 'p-button-success' : 'p-button-danger'}`}
            disabled={!data.expences_type_id || data.amount <= 0}
          />
        </form>
      </div>
    </div>
  )
}

export default HomePage
