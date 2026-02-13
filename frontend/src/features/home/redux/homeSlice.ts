import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { addTransactionActions, expenseTypeActions, homeDataActions, addExpenseTypeActions, updateExpenseTypeActions, deleteExpenseTypeActions } from './homeSagas'

// Define the home state interface
interface HomeState {
  dashboardData: {
    balanceDailyAmt: 0,
    balanceMonthlyAmt: 0,
    dailyLimit:0,
    monthlyLimit:0,
    balanceOverallAmt: 0
  } | null
  expenseTypes: any[]
  isLoading: boolean
  error: string | null,
  deleteSuccess: boolean
}



// Initial state
const initialState: HomeState = {
  dashboardData: null,
  expenseTypes: [],
  isLoading: false,
  error: null,
  deleteSuccess: false
}



// Create the home slice
const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    resetHome: (state) => {
      state.dashboardData = null
      state.expenseTypes = []
      state.isLoading = false
      state.error = null
      state.deleteSuccess = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(homeDataActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(homeDataActions.types.SUCCESS, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.dashboardData = action.payload
      state.error = null
    })
    builder.addCase(homeDataActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.dashboardData = null
      state.error = action.payload
    })
    builder.addCase(expenseTypeActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(expenseTypeActions.types.SUCCESS, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.expenseTypes = action.payload
      state.error = null
    })
    builder.addCase(expenseTypeActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.expenseTypes = []
      state.error = action.payload
    })
    builder.addCase(addTransactionActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(addTransactionActions.types.SUCCESS, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(addTransactionActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // Add Expense Type
    builder.addCase(addExpenseTypeActions.types.REQUEST, (state) => { state.isLoading = true })
    builder.addCase(addExpenseTypeActions.types.SUCCESS, (state) => { state.isLoading = false })
    builder.addCase(addExpenseTypeActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // Update Expense Type
    builder.addCase(updateExpenseTypeActions.types.REQUEST, (state) => { state.isLoading = true })
    builder.addCase(updateExpenseTypeActions.types.SUCCESS, (state) => { state.isLoading = false })
    builder.addCase(updateExpenseTypeActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // Delete Expense Type
    builder.addCase(deleteExpenseTypeActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.deleteSuccess = false
      state.error = null
    })
    builder.addCase(deleteExpenseTypeActions.types.SUCCESS, (state) => {
      state.isLoading = false
      state.deleteSuccess = true
    })
    builder.addCase(deleteExpenseTypeActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.deleteSuccess = false
    })
  }
})

// Export actions
export const {
  resetHome
} = homeSlice.actions

// Export reducer
export default homeSlice.reducer

// Export selectors
export const selectHome = (state: { home: HomeState }) => state.home
export const selectDashboardData = (state: { home: HomeState }) => state.home.dashboardData
export const selectIsLoading = (state: { home: HomeState }) => state.home.isLoading
export const selectError = (state: { home: HomeState }) => state.home.error
export const selectExpenseTypes = (state: { home: HomeState }) => state.home.expenseTypes
export const deleteSuccess = (state: { home: HomeState }) => state.home.deleteSuccess

