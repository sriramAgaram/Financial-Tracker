import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { deleteTransactionActions, listTransactionActions, updateTransactionActions } from "./listSagas"

interface  ResponseOfTransaction{
  transaction_id : number,
  user_id:number,
  expense_type_id: number,
  amount: number,
  created_at: string
}

interface ListState {
  transactions: ResponseOfTransaction[],
  loading: boolean,
  error: string | null,
  updateSuccess: boolean,
  deleteSuccess: boolean,
  totalRecords: number
}


const initialState:ListState  = {
  transactions:[],
  loading: false,
  error: null,
  totalRecords: 0,
  updateSuccess: false,
  deleteSuccess: false
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
    builder.addCase(updateTransactionActions.types.REQUEST, (state) => {
      state.loading = true
      state.updateSuccess = false
    })
    builder.addCase(updateTransactionActions.types.SUCCESS , (state)=>{
      state.loading = false
      state.updateSuccess = true
    })
    builder.addCase(updateTransactionActions.types.FAILURE , (state)=>{
      state.loading = false
      state.updateSuccess = false
    })
    builder.addCase(deleteTransactionActions.types.REQUEST, (state) => {
      state.loading = true
      state.deleteSuccess = false
    })
    builder.addCase(deleteTransactionActions.types.SUCCESS , (state)=>{
      state.loading = false
      state.deleteSuccess = true
    })
    builder.addCase(deleteTransactionActions.types.FAILURE , (state)=>{
      state.loading = false
      state.deleteSuccess = false
    })
  }
})

export default createListSlice.reducer;

export const selectTransaction = (state: {list: ListState}) => state.list
export const selectLoading = (state: {list: ListState}) => state.list.loading
export const selectError = (state: {list: ListState}) => state.list.error
export const selectTransactionsList = (state: {list: ListState}) => state.list.transactions;
export const selectTotalCount = (state: {list: ListState}) =>state.list.totalRecords
export const selectUpdateSuccess = (state: {list: ListState}) =>state.list.updateSuccess
export const selectDeleteSuccess = (state: {list: ListState}) =>state.list.deleteSuccess