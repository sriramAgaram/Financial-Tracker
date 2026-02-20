import { takeEvery } from 'redux-saga/effects'
import apiClient from '../../../client/api.clinet'
import { createApiActions, type ApiResponse } from '../../../store/utils/sagaUtils'
import { createApiWorker } from '../../../store/utils/apiWorker'

/**
 * AUTH SAGAS - REFACTORED WITH FACTORY PATTERN
 * 
 * BEFORE (Junior way): 80+ lines of repetitive code
 * AFTER (Architect way): ~40 lines, all reusable patterns
 */

// ============================================
// TYPE DEFINITIONS
// ============================================
interface LoginPayload {
  username: string
  password: string
}

interface LoginResponse {
  status: boolean
  msg: string
  token: string
}

// Step 1: Initiate
interface InitiateSignupPayload {
  username: string
  name: string
  email: string
}

interface InitiateSignupResponse {
  status: boolean
  msg: string
}

// Step 2: Verify
interface VerifyOtpPayload {
  email: string
  otp: number
}

interface VerifyOtpResponse {
  status: boolean
  msg: string
  signupToken: string
}

// Step 3: Complete
interface CompleteSignupPayload {
  signupToken: string
  password: string
  confirmPassword: string
}

interface CompleteSignupResponse {
  status: boolean
  msg: string
  data: any
}

// ============================================
// ACTION FACTORIES
// ============================================
export const loginActions = createApiActions<LoginPayload, LoginResponse>('auth/login')
export const logoutActions = createApiActions<void, void>('auth/logout')

// 3-Step Signup Actions
export const initiateSignupActions = createApiActions<InitiateSignupPayload, InitiateSignupResponse>('auth/signup/initiate')
export const verifyOtpActions = createApiActions<VerifyOtpPayload, VerifyOtpResponse>('auth/signup/verify')
export const completeSignupActions = createApiActions<CompleteSignupPayload, CompleteSignupResponse>('auth/signup/complete')

// ============================================
// API CALLS
// ============================================
const loginApiCall = async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post('/auth/login', payload)
  return response.data
}

const initiateSignupApiCall = async (payload: InitiateSignupPayload): Promise<ApiResponse<InitiateSignupResponse>> => {
  const response = await apiClient.post('/auth/signup/initiate', payload)
  return response.data
}

const verifyOtpApiCall = async (payload: VerifyOtpPayload): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await apiClient.post('/auth/signup/verify', payload)
  return response.data
}

const completeSignupApiCall = async (payload: CompleteSignupPayload): Promise<ApiResponse<CompleteSignupResponse>> => {
  const response = await apiClient.post('/auth/signup/complete', payload)
  return response.data
}

// ============================================
// WORKER SAGAS
// ============================================
const loginWorker = createApiWorker(loginActions, loginApiCall, (response) => {
  if (response.token) {
    localStorage.setItem('token', response.token)
  }
},undefined,'Login Successful')

const initiateSignupWorker = createApiWorker(initiateSignupActions, initiateSignupApiCall, undefined, undefined, 'OTP Sent Successfully')
const verifyOtpWorker = createApiWorker(verifyOtpActions, verifyOtpApiCall, undefined, undefined, 'OTP Verified')
const completeSignupWorker = createApiWorker(completeSignupActions, completeSignupApiCall, undefined, undefined, 'Signup Completed')

// ============================================
// WATCHER SAGA
// ============================================
function* authWatcher(): Generator {
  yield takeEvery(loginActions.types.REQUEST, loginWorker)
  yield takeEvery(initiateSignupActions.types.REQUEST, initiateSignupWorker)
  yield takeEvery(verifyOtpActions.types.REQUEST, verifyOtpWorker)
  yield takeEvery(completeSignupActions.types.REQUEST, completeSignupWorker)
}

export default authWatcher
