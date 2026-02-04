import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loginActions, signupActions, logoutActions } from './authSagas'

/**
 * AUTH SLICE - REFACTORED WITH FACTORY PATTERN
 * 
 * BEFORE: Manual reducers for each action (loginStart, loginSuccess, loginFailure, etc.)
 * AFTER: extraReducers that listen to the factory-generated action types
 */

const token = localStorage.getItem('token')


// ============================================
// STATE INTERFACE
// ============================================
interface AuthState {
  user: {
    status: boolean | null
    msg: string | null
    token: string | null
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signupSuccess: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !! token,
  isLoading: false,
  error: null,
  signupSuccess: false,
}

// ============================================
// SLICE WITH EXTRA REDUCERS
// ============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // ========== LOGIN ==========
    builder.addCase(loginActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(loginActions.types.SUCCESS, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
    })
    builder.addCase(loginActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
    })

    // ========== SIGNUP ==========
    builder.addCase(signupActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signupActions.types.SUCCESS, (state) => {
      state.isLoading = false
      state.signupSuccess = true
      state.error = null
    })
    builder.addCase(signupActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // ========== LOGOUT ==========
    builder.addCase(logoutActions.types.REQUEST, (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
    })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer

// ============================================
// SELECTORS
// ============================================
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectError = (state: { auth: AuthState }) => state.auth.error
export const selectSignupSuccess = (state: { auth: AuthState }) => state.auth.signupSuccess
