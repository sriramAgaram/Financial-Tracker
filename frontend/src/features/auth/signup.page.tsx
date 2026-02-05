import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { selectError, selectSignupSuccess } from "./redux/authSlice";
import { signupActions } from "./redux/authSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { showToast } from "../../store/uiSlice";

const SignUpPage: React.FC = () => {

    const dispatch = useDispatch();
    const signupSuccess = useAppSelector(selectSignupSuccess);
    const signupError = useAppSelector(selectError);

    const [value, setValue] = useState({
        name: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        if (signupSuccess) {
            setValue({ name: '', username: '', password: '' });
        }
        if (signupError) {
            dispatch(showToast({
                severity: 'error',
                summary: 'Error',
                detail: signupError || 'Something went wrong',
                life: 3000}))
        }
    }, [signupSuccess, signupError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value: inputValue } = e.target;
        setValue(prev => ({
            ...prev,
            [name]: inputValue
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(signupActions.request({username:value.username , password: value.password , name:value.name}))
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                        Create Account
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">Join us to get started</p>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="w-full">
                        <span className="p-float-label w-full block">
                            <InputText 
                                name="name" 
                                id="name" 
                                value={value.name} 
                                onChange={handleChange} 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-slate-700 bg-white/50" 
                            />
                            <label htmlFor="name" className="text-slate-500">Name</label>
                        </span>
                    </div>

                    <div className="w-full">
                        <span className="p-float-label w-full block">
                            <InputText 
                                name="username" 
                                id="username" 
                                value={value.username} 
                                onChange={handleChange} 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-slate-700 bg-white/50" 
                            />
                            <label htmlFor="username" className="text-slate-500">Username</label>
                        </span>
                    </div>

                    <div className="w-full">
                        <span className="p-float-label w-full block">
                            <InputText 
                                name="password" 
                                id="password" 
                                type="password" 
                                value={value.password} 
                                onChange={handleChange} 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-slate-700 bg-white/50" 
                            />
                            <label htmlFor="password" className="text-slate-500">Password</label>
                        </span>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Sign Up
                    </button>
                    
                    <div className="text-center mt-2">
                        <span className="text-slate-500 text-sm">Already have an account? </span>
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SignUpPage
