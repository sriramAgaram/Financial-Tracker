import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getProfileActions, updateProfileActions, sendOtpActions, verifyEmailActions } from './profileSagas';

export interface UserProfile {
    user_id: string; // UUID from Supabase
    name: string;
    username: string;
    email: string;
    is_verified: boolean;
}

export interface ProfileState {
    data: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isOtpSent: boolean;
}

const initialState: ProfileState = {
    data: null,
    isLoading: false,
    error: null,
    isOtpSent: false,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        resetOtpStatus: (state) => {
            state.isOtpSent = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfileActions.types.REQUEST, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfileActions.types.SUCCESS, (state, action: PayloadAction<UserProfile>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(getProfileActions.types.FAILURE, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateProfileActions.types.REQUEST, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfileActions.types.SUCCESS, (state, action: PayloadAction<UserProfile>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(updateProfileActions.types.FAILURE, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(sendOtpActions.types.REQUEST, (state) => {
                state.isLoading = true;
                state.isOtpSent = false;
            })
            .addCase(sendOtpActions.types.SUCCESS, (state) => {
                state.isLoading = false;
                state.isOtpSent = true;
            })
            .addCase(sendOtpActions.types.FAILURE, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(verifyEmailActions.types.REQUEST, (state) => {
                state.isLoading = true;
            })
            .addCase(verifyEmailActions.types.SUCCESS, (state) => {
                state.isLoading = false;
                if (state.data) state.data.is_verified = true;
                state.isOtpSent = false;
            })
            .addCase(verifyEmailActions.types.FAILURE, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetOtpStatus } = profileSlice.actions;

export default profileSlice.reducer;

export const selectProfile = (state: { profile: ProfileState }) => state.profile;
export const selectProfileData = (state: { profile: ProfileState }) => state.profile.data;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.isLoading;
export const selectIsOtpSent = (state: { profile: ProfileState }) => state.profile.isOtpSent;
