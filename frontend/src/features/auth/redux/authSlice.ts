import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loginActions, initiateSignupActions, verifyOtpActions, completeSignupActions, logoutActions } from './authSagas'

/**
 * AUTH SLICE - REFACTORED
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
  
  // Signup State
  signupStep: 1 | 2 | 3 // 1: Initiate, 2: Verify, 3: Complete
  signupEmail: string | null
  signupToken: string | null // Token from verify step
  signupSuccess: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
  
  signupStep: 1,
  signupEmail: null,
  signupToken: null,
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
    resetAuth: (state) => {
      state.isLoading = false
      state.error = null
      state.signupSuccess = false
      state.signupStep = 1
      state.signupEmail = null
      state.signupToken = null
    },
    setSignupEmail: (state, action: PayloadAction<string>) => {
      state.signupEmail = action.payload
    }
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

    // ========== SIGNUP STEP 1: INITIATE ==========
    builder.addCase(initiateSignupActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(initiateSignupActions.types.SUCCESS, (state) => {
      state.isLoading = false
      state.signupStep = 2 // Move to OTP
      state.error = null
    })
    builder.addCase(initiateSignupActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // ========== SIGNUP STEP 2: VERIFY OTP ==========
    builder.addCase(verifyOtpActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(verifyOtpActions.types.SUCCESS, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.signupStep = 3 // Move to Password
      state.signupToken = action.payload.signupToken
      state.error = null
    })
    builder.addCase(verifyOtpActions.types.FAILURE, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    })

    // ========== SIGNUP STEP 3: COMPLETE ==========
    builder.addCase(completeSignupActions.types.REQUEST, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(completeSignupActions.types.SUCCESS, (state) => {
      state.isLoading = false
      state.signupSuccess = true // Done!
      state.error = null
    })
    builder.addCase(completeSignupActions.types.FAILURE, (state, action: PayloadAction<string>) => {
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

export const { clearError, resetAuth, setSignupEmail } = authSlice.actions

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
export const selectSignupStep = (state: { auth: AuthState }) => state.auth.signupStep
export const selectSignupEmail = (state: { auth: AuthState }) => state.auth.signupEmail
export const selectSignupToken = (state: { auth: AuthState }) => state.auth.signupToken
