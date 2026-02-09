import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'
import authReducer from '../features/auth/redux/authSlice'
import homeReducer from '../features/home/redux/homeSlice'
import listReducer from '../features/list/redux/listSlice'
import settingsReducer from '../features/settings/redux/settingsSlice'
import uiReducer from './uiSlice'
import dashboardReducer from '../features/Dashboard/redux/dashboard.slice'

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware()

// Configure the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    list: listReducer,
    settings: settingsReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(sagaMiddleware),
})

// Run the root saga
sagaMiddleware.run(rootSaga)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
