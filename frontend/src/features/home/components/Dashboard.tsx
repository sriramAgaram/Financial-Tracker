import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppSelector'
import { homeDataActions } from '../redux/homeSagas'

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { dashboardData, isLoading, error } = useAppSelector((state: any) => state.home)

  useEffect(() => {
    dispatch(homeDataActions.request())
  }, [dispatch])

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard data...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">${dashboardData.totalIncome}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">${dashboardData.totalExpenses}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance</h3>
            <p className="text-2xl font-bold text-blue-600">${dashboardData.balance}</p>
          </div>
        </div>
      )}

      {dashboardData?.recentTransactions && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {dashboardData.recentTransactions.map((transaction: any) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
