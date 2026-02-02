import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { selectIsAuthenticated } from "./redux/authSlice";
import { loginActions } from "./redux/authSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { showToast } from "../../store/uiSlice";


const LoginPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    const [value, setValue] = useState({
        username: '',
        password: ''
    });

    const handelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value: inputValue } = e.target;
        setValue(prev => ({
            ...prev,
            [name]: inputValue
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(loginActions.request({ username: value.username, password: value.password }));
        setValue({
            username: '',
            password: ''
        });
        dispatch(showToast({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful',
            life: 3000
        }))
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated])

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">Please sign in to continue</p>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="w-full">
                        <span className="p-float-label w-full block">
                            <InputText 
                                name="username" 
                                id="username" 
                                value={value.username} 
                                onChange={handelChange} 
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
                                onChange={handelChange}
                                className="w-full p-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-slate-700 bg-white/50" 
                            />
                            <label htmlFor="password" className="text-slate-500">Password</label>
                        </span>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Login
                    </button>
                    
                    <div className="text-center mt-2">
                        <span className="text-slate-500 text-sm">Don't have an account? </span>
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default LoginPage
