import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FloatLabel } from 'primereact/floatlabel';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetOtpStatus, selectProfileData, selectProfileLoading, selectIsOtpSent } from './redux/profileSlice';
import { getProfileActions, sendOtpActions, updateProfileActions, verifyEmailActions } from './redux/profileSagas';
import { useAppSelector } from '../../hooks/useAppSelector';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const profile = useAppSelector(selectProfileData);
    const isLoading = useAppSelector(selectProfileLoading);
    const isOtpSent = useAppSelector(selectIsOtpSent);

    const [isEditing, setIsEditing] = useState(false);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState('');

    useEffect(() => {
        dispatch(getProfileActions.request());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            name: profile?.name || '',
            username: profile?.username || '',
            email: profile?.email || '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Full name is required'),
            username: Yup.string().required('Username is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
        }),
        onSubmit: (values) => {
            dispatch(updateProfileActions.request(values));
            setIsEditing(false);
        },
    });

    const handleVerifyClick = () => {
        if (profile?.email) {
            dispatch(sendOtpActions.request({ 
                email: formik.values.email,
                name: formik.values.name,
                username: formik.values.username 
            }));
            setShowOtpDialog(true);
        }
    };

    const handleVerifySubmit = () => {
        if (profile?.email && otp.length === 6) {
            dispatch(verifyEmailActions.request({ email: profile.email, otp }));
            setShowOtpDialog(false);
            setOtp('');
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)]">
                <div className="grid md:grid-cols-12">
                    
                    {/* Left Section: Visual Identity */}
                    <div className="col-span-full md:col-span-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-10 flex flex-col items-center justify-center text-white relative overflow-hidden">
                        {/* Decorative Circles */}
                        <div className="-top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl absolute"></div>
                        <div className="-bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl absolute"></div>
                        
                        <div className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-md rounded-[2.5rem] border-2 border-white/30 flex items-center justify-center mb-6 shadow-2xl">
                            <i className="pi pi-user text-6xl text-white"></i>
                        </div>
                        
                        <div className="text-center relative z-10">
                            <h2 className="text-2xl font-bold tracking-tight">{profile?.name || 'Loading...'}</h2>
                            <p className="text-indigo-100/80 text-sm font-medium mt-1">@{profile?.username || 'user'}</p>
                            
                            <div className="mt-8 inline-flex items-center px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 text-xs font-semibold">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                                Active Member
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Form Content */}
                    <div className="col-span-full md:col-span-8 p-8 md:p-12 bg-white/30">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Account Details</h3>
                                <p className="text-slate-500 text-sm mt-1">Manage your personal information and verified status.</p>
                            </div>
                            {!isEditing && (
                                <Button 
                                    icon="pi pi-pencil" 
                                    className="p-button-rounded p-button-text bg-indigo-50 hover:bg-indigo-100 text-indigo-600 w-12 h-12" 
                                    onClick={() => setIsEditing(true)}
                                    tooltip="Edit Profile"
                                />
                            )}
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatLabel>
                                    <InputText 
                                        id="name" 
                                        name="name"
                                        value={formik.values.name} 
                                        onChange={formik.handleChange} 
                                        disabled={!isEditing}
                                        className={`w-full p-4 rounded-2xl transition-all duration-300 ${isEditing ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-100/50 border-transparent text-slate-600'}`}
                                    />
                                    <label htmlFor="name" className="ml-2">Full Name</label>
                                </FloatLabel>

                                <FloatLabel>
                                    <InputText 
                                        id="username" 
                                        name="username"
                                        value={formik.values.username} 
                                        onChange={formik.handleChange} 
                                        disabled={!isEditing}
                                        className={`w-full p-4 rounded-2xl transition-all duration-300 ${isEditing ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-100/50 border-transparent text-slate-600'}`}
                                    />
                                    <label htmlFor="username" className="ml-2">Username</label>
                                </FloatLabel>
                            </div>

                            <div className="relative">
                                <FloatLabel>
                                    <InputText 
                                        id="email" 
                                        name="email"
                                        value={formik.values.email} 
                                        onChange={formik.handleChange} 
                                        disabled={!isEditing}
                                        className={`w-full p-4 rounded-2xl transition-all duration-300 ${isEditing ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-100/50 border-transparent text-slate-600'}`}
                                    />
                                    <label htmlFor="email" className="ml-2">Email Address</label>
                                </FloatLabel>
                                
                                {!isEditing && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        {profile?.is_verified ? (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                                <i className="pi pi-verified text-sm"></i>
                                            </div>
                                        ) : (
                                            <Button 
                                                label="VERIFY NOW"
                                                icon="pi pi-shield"
                                                className="p-button-sm bg-amber-500 border-none rounded-full px-4 py-2 text-[10px] font-black text-white hover:bg-amber-600 shadow-md transition-all hover:scale-105 active:scale-95"
                                                onClick={handleVerifyClick}
                                                loading={isLoading}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-4 pt-4">
                                    <Button 
                                        type="button" 
                                        label="Cancel" 
                                        className="p-button-text text-slate-400 font-bold px-6 hover:text-slate-600" 
                                        onClick={() => { setIsEditing(false); formik.resetForm(); }} 
                                    />
                                    <Button 
                                        type="submit" 
                                        label="Save Changes" 
                                        icon="pi pi-check" 
                                        className="bg-indigo-600 border-none rounded-[1.25rem] px-8 py-4 font-bold shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105" 
                                        loading={isLoading}
                                    />
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Premium OTP Dialog */}
            <Dialog 
                header={null}
                visible={showOtpDialog} 
                onHide={() => setShowOtpDialog(false)}
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none overflow-hidden"
                modal
                maskClassName="backdrop-blur-md bg-slate-900/40"
            >
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <i className="pi pi-envelope text-4xl text-amber-600"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Verify Email</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        We've sent a 6-digit verification code to <br/>
                        <span className="font-bold text-slate-700">{profile?.email}</span>
                    </p>
                    
                    <div className="mb-8">
                        <InputText 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            maxLength={6} 
                            placeholder="0 0 0 0 0 0"
                            className="w-full text-center text-4xl font-black tracking-[0.5em] p-5 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button 
                            label="CONFIRM VERIFICATION" 
                            className="w-full bg-indigo-600 border-none rounded-[1.25rem] py-5 font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all" 
                            onClick={handleVerifySubmit}
                            loading={isLoading}
                            disabled={otp.length !== 6}
                        />
                        <Button 
                            label="Resend Code" 
                            className="p-button-text text-indigo-600 font-bold" 
                            onClick={() => dispatch(sendOtpActions.request({ email: formik.values.email || '', name: formik.values.name, username: formik.values.username}))}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ProfilePage;
