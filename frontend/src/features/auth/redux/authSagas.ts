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

interface SignupPayload {
  username: string
  password: string
  name: string
}

interface SignupResponse {
  status: boolean
  msg: string
  data: any
}

// ============================================
// ACTION FACTORIES (One line creates 3 actions!)
// ============================================
export const loginActions = createApiActions<LoginPayload, LoginResponse>('auth/login')
export const signupActions = createApiActions<SignupPayload, SignupResponse>('auth/signup')
export const logoutActions = createApiActions<void, void>('auth/logout')

// ============================================
// API CALLS (Now using apiClient)
// ============================================
const loginApiCall = async (payload: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post('/auth/login', payload)
  return response.data
}

const signupApiCall = async (payload: SignupPayload): Promise<ApiResponse<SignupResponse>> => {
  const response = await apiClient.post('/auth/signup', payload)
  return response.data
}

// ============================================
// WORKER SAGAS (Created by factory - ONE LINE each!)
// ============================================
const loginWorker = createApiWorker(loginActions, loginApiCall, (response) => {
  if (response.token) {
    localStorage.setItem('token', response.token)
  }
},undefined,'Login Successful')

const signupWorker = createApiWorker(signupActions, signupApiCall,undefined,undefined,'Signup Successful')

// ============================================
// WATCHER SAGA
// ============================================
function* authWatcher(): Generator {
  yield takeEvery(loginActions.types.REQUEST, loginWorker)
  yield takeEvery(signupActions.types.REQUEST, signupWorker)
}

export default authWatcher
