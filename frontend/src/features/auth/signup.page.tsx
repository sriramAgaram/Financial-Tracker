import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { InputText } from "primereact/inputtext";
import { InputOtp } from "primereact/inputotp";
import { 
    selectSignupSuccess, 
    selectIsLoading, 
    selectSignupStep, 
    selectSignupEmail, 
    selectSignupToken,
    setSignupEmail,
    resetAuth
} from "./redux/authSlice";
import { initiateSignupActions, verifyOtpActions, completeSignupActions } from "./redux/authSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import * as Yup from 'yup';

// Validation Schemas
const initiateSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
});

const verifySchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required').length(4, 'OTP must be 4 digits'),
});

const completeSchema = Yup.object().shape({
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'),''], 'Passwords must match').required('Confirm Password is required'),
});

const SignUpPage: React.FC = () => {
    const dispatch = useDispatch();
    const signupSuccess = useAppSelector(selectSignupSuccess);
    const isLoading = useAppSelector(selectIsLoading);
    const step = useAppSelector(selectSignupStep);
    const signupEmail = useAppSelector(selectSignupEmail);
    const signupToken = useAppSelector(selectSignupToken);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    useEffect(() => {
        if (signupSuccess) {
            navigate('/login');
        }
    }, [signupSuccess, navigate]);

    // Step 1: Initiate
    const handleInitiate = (values: { name: string, username: string, email: string }) => {
        dispatch(setSignupEmail(values.email));
        dispatch(initiateSignupActions.request(values));
    };

    // Step 2: Verify
    const handleVerify = (values: { otp: string }) => {
        if (!signupEmail) return;
        dispatch(verifyOtpActions.request({ email: signupEmail, otp: Number.parseInt(values.otp) }));
    };

    // Step 3: Complete
    const handleComplete = (values: { password: string, confirmPassword: string }) => {
        if (!signupToken) return;
        dispatch(completeSignupActions.request({ 
            signupToken, 
            password: values.password,
            confirmPassword: values.confirmPassword 
        }));
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
             <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                        {step === 1 && "Create Account"}
                        {step === 2 && "Verify Email"}
                        {step === 3 && "Set Password"}
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        {step === 1 && "Join us to get started"}
                        {step === 2 && `Enter OTP sent to ${signupEmail}`}
                        {step === 3 && "Secure your account"}
                    </p>
                </div>

                {/* Step 1: Initiate Form */}
                {step === 1 && (
                    <Formik
                        initialValues={{ name: '', username: '', email: '' }}
                        validationSchema={initiateSchema}
                        onSubmit={handleInitiate}
                    >
                        {({ values, errors, touched, handleChange, handleBlur }) => (
                            <Form className="flex flex-col gap-6">
                                <div>
                                    <span className="p-float-label w-full block">
                                        <InputText name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} className={errors.name && touched.name ? 'p-invalid w-full' : 'w-full'} />
                                        <label htmlFor="name">Name</label>
                                    </span>
                                    {errors.name && touched.name && <small className="text-red-500 text-xs mt-1 block">{errors.name}</small>}
                                </div>
                                <div>
                                    <span className="p-float-label w-full block">
                                        <InputText name="username" value={values.username} onChange={handleChange} onBlur={handleBlur} className={errors.username && touched.username ? 'p-invalid w-full' : 'w-full'} />
                                        <label htmlFor="username">Username</label>
                                    </span>
                                    {errors.username && touched.username && <small className="text-red-500 text-xs mt-1 block">{errors.username}</small>}
                                </div>
                                <div>
                                    <span className="p-float-label w-full block">
                                        <InputText name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} className={errors.email && touched.email ? 'p-invalid w-full' : 'w-full'} />
                                        <label htmlFor="email">Email</label>
                                    </span>
                                    {errors.email && touched.email && <small className="text-red-500 text-xs mt-1 block">{errors.email}</small>}
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                    {isLoading ? 'Sending OTP...' : 'Next'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}

                {/* Step 2: Verify Form */}
                {step === 2 && (
                    <Formik
                        initialValues={{ otp: '' }}
                        validationSchema={verifySchema}
                        onSubmit={handleVerify}
                    >
                        {({ values, errors, touched, setFieldValue }) => (
                            <Form className="flex flex-col gap-6 text-center">
                                <div>
                                    <div className="flex justify-center mb-4">
                                        <InputOtp 
                                            name="otp" 
                                            value={values.otp} 
                                            onChange={(e) => {
                                                const val = e.value?.toString() || '';
                                                setFieldValue('otp', val);
                                            }} 
                                            length={4} 
                                            integerOnly
                                            className={errors.otp && touched.otp ? 'p-invalid' : ''}
                                        />
                                    </div>
                                    {errors.otp && touched.otp && <small className="text-red-500 text-xs mt-1 block">{errors.otp}</small>}
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}

                {/* Step 3: Complete Form */}
                {step === 3 && (
                    <Formik
                        initialValues={{ password: '', confirmPassword: '' }}
                        validationSchema={completeSchema}
                        onSubmit={handleComplete}
                    >
                        {({ values, errors, touched, handleChange, handleBlur }) => (
                            <Form className="flex flex-col gap-6">
                                <div>
                                    <span className="p-float-label w-full block">
                                        <InputText type="password" name="password" value={values.password} onChange={handleChange} onBlur={handleBlur} className={errors.password && touched.password ? 'p-invalid w-full' : 'w-full'} />
                                        <label htmlFor="password">Password</label>
                                    </span>
                                    {errors.password && touched.password && <small className="text-red-500 text-xs mt-1 block">{errors.password}</small>}
                                </div>
                                <div>
                                    <span className="p-float-label w-full block">
                                        <InputText type="password" name="confirmPassword" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={errors.confirmPassword && touched.confirmPassword ? 'p-invalid w-full' : 'w-full'} />
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                    </span>
                                    {errors.confirmPassword && touched.confirmPassword && <small className="text-red-500 text-xs mt-1 block">{errors.confirmPassword}</small>}
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                    {isLoading ? 'Creating Account...' : 'Finish Signup'}
                                </button>
                            </Form>
                        )}
                    </Formik>
                )}

                <div className="text-center mt-4">
                    <span className="text-slate-500 text-sm">Already have an account? </span>
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;