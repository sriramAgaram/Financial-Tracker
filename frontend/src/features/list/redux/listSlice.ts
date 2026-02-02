import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { listTransactionActions } from "./listSagas"

interface  ResponseOfTransaction{
  transaction_id : number,
  user_id:number,
  expense_type_id: number,
  amount: number,
  created_at: string
  expense_type: {
    expense_name: string
  }
}

interface ListState {
  transactions: ResponseOfTransaction[],
  loading: boolean,
  error: string | null
  totalRecords: number
}


const initialState:ListState  = {
  transactions:[],
  loading: false,
  error: null,
  totalRecords: 0
}


const createListSlice = createSlice({
  name: 'transaction',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) =>{
    builder.addCase(listTransactionActions.types.REQUEST, (state) =>{
      state.loading = true
      state.error = null
    })
    builder.addCase(listTransactionActions.types.SUCCESS, (state, action: PayloadAction<{data: ResponseOfTransaction[], total_count: number}>)=>{
      state.loading= false
      state.transactions = action.payload.data
      state.totalRecords = action.payload.total_count
      state.error = null
    })
    builder.addCase(listTransactionActions.types.FAILURE, (state, action: PayloadAction<string>)=>{
      state.loading = false
      state.error = action.payload
    })
  }
})

export default createListSlice.reducer;

export const selectTransaction = (state: {list: ListState}) => state.list
export const selectLoading = (state: {list: ListState}) => state.list.loading
export const selectError = (state: {list: ListState}) => state.list.error
export const selectTransactionsList = (state: {list: ListState}) => state.list.transactions;
export const selectTotalCount = (state: {list: ListState}) =>state.list.totalRecords