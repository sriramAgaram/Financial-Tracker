import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * FACTORY PATTERN FOR REDUX-SAGA
 * 
 * Instead of writing loginStart, loginSuccess, loginFailure manually,
 * we create ONE function that generates all three automatically.
 * 
 * Usage:
 *   const loginActions = createApiActions<LoginPayload, LoginResponse>('auth/login')
 *   
 *   // This gives you:
 *   // - loginActions.request(payload) -> dispatches 'auth/login_REQUEST'
 *   // - loginActions.success(data) -> dispatches 'auth/login_SUCCESS'
 *   // - loginActions.failure(error) -> dispatches 'auth/login_FAILURE'
 */

// Generic API Response type
export interface ApiResponse<T = any> {
  status: boolean
  msg: string
  data?: T
  token?: string
}

// Action type suffixes
export const REQUEST = '_REQUEST'
export const SUCCESS = '_SUCCESS'
export const FAILURE = '_FAILURE'

/**
 * Creates typed action creators for API calls
 * 
 * @param baseType - The base action type (e.g., 'auth/login')
 * @returns Object with request, success, failure action creators
 */
export function createApiActions<TPayload, TResponse>(baseType: string) {
  return {
    // Action Types (for watchers)
    types: {
      REQUEST: `${baseType}${REQUEST}`,
      SUCCESS: `${baseType}${SUCCESS}`,
      FAILURE: `${baseType}${FAILURE}`,
    },
    
    // Action Creators
    request: (payload: TPayload): PayloadAction<TPayload> => ({
      type: `${baseType}${REQUEST}`,
      payload,
    }),
    
    success: (payload: TResponse): PayloadAction<TResponse> => ({
      type: `${baseType}${SUCCESS}`,
      payload,
    }),
    
    failure: (payload: string): PayloadAction<string> => ({
      type: `${baseType}${FAILURE}`,
      payload,
    }),
  }
}

// Type helper for extracting action types
export type ApiActions<TPayload, TResponse> = ReturnType<typeof createApiActions<TPayload, TResponse>>
