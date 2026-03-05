
import {type Middleware } from 'redux';
import { showToast } from './uiSlice';

export const toastMiddleware: Middleware = store => next => action => {
    const result = next(action);
    const type = (action as any).type;

    if (type.endsWith('FAILURE')) {
        const error = (action as any).payload;
        store.dispatch(showToast({
            severity: 'error',
            summary: 'Error',
            detail: error || 'Something went wrong',
            life: 3000
        }));
    }

    if(type.endsWith('SUCCESS') && (action as any).meta?.toast){
         store.dispatch(showToast({
            severity: 'success',
            summary: 'Success',
            detail: (action as any).meta?.toast || 'Operation Successful',
            life: 3000
        }));
    }

    return result;
};
