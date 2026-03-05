import { takeEvery } from 'redux-saga/effects';
import apiClient from '../../../client/api.clinet';
import { createApiActions } from '../../../store/utils/sagaUtils';
import { createApiWorker } from '../../../store/utils/apiWorker';


export const getProfileActions = createApiActions<void, any>('profile/get')
export const updateProfileActions = createApiActions<any, any>('profile/update')
export const sendOtpActions = createApiActions<{ email: string; name: string; username: string }, any>('profile/send-otp')
export const verifyEmailActions = createApiActions<{ email: string; otp: number }, any>('profile/verify-email')



const handleGetProfile = async () => {
    const response = await apiClient.get('/user/details');
    return response.data;
}

const handleUpdateProfile = async (data: any) => {
    const response = await apiClient.put(`/user/update`, data);
    return response.data;
}


const handleSendOtp = async (payload: { email: string }) => {
    const response = await apiClient.post('/user/send-otp', payload);
    return response.data;
}


const handleVerifyEmail = async (data: { email: string; otp: number }) => {
    const response = await apiClient.post('/user/verify-email', data);
    return response.data;
}



const getAllProfileWorker = createApiWorker(getProfileActions,handleGetProfile);
const sendOtpWorker = createApiWorker(sendOtpActions, handleSendOtp, undefined, undefined, 'OTP Sent Successfully');
const verifyEmailWorker = createApiWorker(verifyEmailActions, handleVerifyEmail);
const updateProfileWorker = createApiWorker(updateProfileActions, handleUpdateProfile);



// Watcher
export default function* profileSaga() {
    yield takeEvery(getProfileActions.types.REQUEST, getAllProfileWorker)
    yield takeEvery(updateProfileActions.types.REQUEST, updateProfileWorker);
    yield takeEvery(sendOtpActions.types.REQUEST, sendOtpWorker);
    yield takeEvery(verifyEmailActions.types.REQUEST, verifyEmailWorker);
}
