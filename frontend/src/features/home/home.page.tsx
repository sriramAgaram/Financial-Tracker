import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {selectExpenseTypes, selectDashboardData } from './redux/homeSlice';
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useAppSelector } from '../../hooks/useAppSelector';
import { addTransactionActions, expenseTypeActions, homeDataActions } from './redux/homeSagas';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const expenseTypes = useSelector(selectExpenseTypes);
  const amountData = useAppSelector(selectDashboardData)
  const [data, setData] = useState({
    expences_type_id: null,
    amount: 0
  });

  useEffect(() => {
    dispatch(homeDataActions.request())
    dispatch(expenseTypeActions.request())
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
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.expences_type_id && data.amount > 0) {
      dispatch(addTransactionActions.request({
        expense_type_id: data.expences_type_id,
        amount: data.amount
      }));
      setData({
        expences_type_id: null,
        amount: 0
      })
      dispatch(homeDataActions.request())
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-heading mb-4">Welcome to the Home Page</h1>
      <p className="text-body mb-6">
        This is the main dashboard where you can see an overview of your financial data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Total Balance</h2>
          <p className="text-3xl font-bold text-fg-brand">₹{amountData?.balanceDailyAmt}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Monthly Expenses</h2>
          <p className="text-3xl font-bold text-fg-danger">₹{amountData?.balanceMonthlyAmt}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-default">
          <h2 className="text-lg font-semibold text-heading mb-2">Savings</h2>
          <p className="text-3xl font-bold text-fg-success">₹0.00</p>
        </div>
      </div>

       <div className='flex w-full justify-center items-center pt-20'>
          <Card title="Add New Transaction" className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  options={expenseTypes}
                  optionLabel="expense_name"
                  optionValue="expense_type_id"
                  placeholder="Select Expense Type"
                  className="w-full"
                  showClear
                />
              </div>

              <Button
                type="submit"
                label="Add Transaction"
                icon="pi pi-plus"
                className="w-full mt-2"
                disabled={!data.expences_type_id || data.amount <= 0}
              />
            </form>
          </Card>
        </div>
    </div>
  )
}

export default HomePage
