import { call, put } from 'redux-saga/effects'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ApiActions, ApiResponse } from './sagaUtils'

/**
 * GENERIC API WORKER SAGA (The Factory Machine)
 * 
 * Instead of writing:
 *   function* loginSaga() { try { call(api); put(success) } catch { put(failure) } }
 *   function* signupSaga() { try { call(api); put(success) } catch { put(failure) } }
 * 
 * We write ONE function that works for ALL API calls:
 *   createApiWorker(loginActions, loginApiCall)
 *   createApiWorker(signupActions, signupApiCall)
 * 
 * This is the "Factory Machine" - it builds sagas for you.
 */

/**
 * Creates a generic API worker saga
 * 
 * @param actions - The action creators from createApiActions
 * @param apiCall - The async function that makes the API request
 * @param onSuccess - Optional callback after success (e.g., save token to localStorage)
 * @param afterSuccessAction - Optional action to dispatch after success
 */
export function createApiWorker<TPayload, TResponse>(
  actions: ApiActions<TPayload, TResponse>,
  apiCall: (payload: TPayload) => any,
  onSuccess?: (response: ApiResponse<TResponse>, payload: TPayload) => void,
  afterSuccessAction?: () => PayloadAction<any>
) {
  return function* (action: PayloadAction<TPayload>): Generator {
    try {
      const response = (yield call(apiCall, action.payload)) as ApiResponse<TResponse>
      
      if (response?.status) {
        // Send response.data to state (the actual data, not the wrapper)
        yield put(actions.success((response.data ?? response) as TResponse))
        
        if(afterSuccessAction){
          yield put(afterSuccessAction())
        }
        // Run optional callback (e.g., save token) - pass full response for callbacks
        if (onSuccess) {
          onSuccess(response, action.payload)
        }
      } else {
        yield put(actions.failure(response?.msg || 'Request failed'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || error.message || 'An error occurred';
      yield put(actions.failure(errorMessage));
    }
  }
}

/**
 * Example usage in authSagas.ts:
 * 
 * // Define actions
 * export const loginActions = createApiActions<LoginPayload, LoginResponse>('auth/login')
 * 
 * // Define API call
 * const loginApiCall = async (payload: LoginPayload) => {
 *   const response = await axios.post('/auth/login', payload)
 *   return response.data
 * }
 * 
 * // Create worker saga (ONE LINE instead of 10 lines)
 * const loginWorker = createApiWorker(loginActions, loginApiCall, () => loginActions.success())
 * 
 * // Watcher saga
 * function* authWatcher(): Generator {
 *   yield takeEvery(loginActions.types.REQUEST, loginWorker)
 * }
 */
