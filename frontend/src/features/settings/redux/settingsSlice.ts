import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { LimitFetchActions, settingsUpdateActions } from './settingsSagas'

// Define interfaces for settings state
interface UserSettings {
  limit_id: number | null
  daily_limit: number
  monthly_limit: number,
  overall_amount: number
}

interface SettingsState {
  userSettings: UserSettings | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: SettingsState = {
  userSettings: {
    limit_id: null,
    monthly_limit: 1000,
    daily_limit: 100,
    overall_amount:1000
  },
  isLoading: false,
  error: null,
}

// Create the settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers:{},
  extraReducers: (builder) =>{
    builder.addCase(LimitFetchActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(LimitFetchActions.types.SUCCESS, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      const limits = action.payload[0]
      state.userSettings = limits
      state.error = null
    })
    builder.addCase(LimitFetchActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })
    builder.addCase(settingsUpdateActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(settingsUpdateActions.types.SUCCESS, (state, action: PayloadAction<UserSettings>) => {
      state.isLoading = false
      state.userSettings = action.payload
      state.error = null
    })
    builder.addCase(settingsUpdateActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })
  }
})

// Export reducer
export default settingsSlice.reducer

// Export selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings
export const selectUserSettings = (state: { settings: SettingsState }) => state.settings.userSettings
export const selectIsLoading = (state: { settings: SettingsState }) => state.settings.isLoading
export const selectError = (state: { settings: SettingsState }) => state.settings.error
