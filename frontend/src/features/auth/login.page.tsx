import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Formik, Form } from "formik";
import { selectIsAuthenticated, selectIsLoading } from "./redux/authSlice";
import { loginActions } from "./redux/authSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { loginSchema } from "./services/schema";

interface LoginValues {
    username: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectIsLoading);

    const initialValues: LoginValues = {
        username: '',
        password: ''
    };

    const handleSubmit = (values: LoginValues) => {
        dispatch(loginActions.request({ username: values.username, password: values.password }));
    };

    // Navigation Effect: Navigate only on success (isAuthenticated)
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate, dispatch]);



    return (
        <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
        >
            {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                                Welcome Back
                            </h1>
                            <p className="text-slate-500 mt-2 text-sm">Please sign in to continue</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Username Field */}
                            <div className="w-full">
                                <span className="p-float-label w-full block">
                                    <InputText
                                        name="username"
                                        id="username"
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.username && touched.username ? 'p-invalid w-full' : 'w-full'}
                                    />
                                    <label htmlFor="username" className="text-slate-500">Username</label>
                                </span>
                                {errors.username && touched.username && (
                                    <small className="text-red-500 text-xs mt-1 block">{errors.username}</small>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="w-full">
                                <span className="p-float-label w-full block">
                                    <InputText
                                        name="password"
                                        id="password"
                                        type="password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.password && touched.password ? 'p-invalid w-full' : 'w-full'}
                                    />
                                    <label htmlFor="password" className="text-slate-500">Password</label>
                                </span>
                                {errors.password && touched.password && (
                                    <small className="text-red-500 text-xs mt-1 block">{errors.password}</small>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Logging In...' : 'Login'}
                            </button>

                            <div className="text-center mt-2">
                                <span className="text-slate-500 text-sm">Don't have an account? </span>
                                <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default LoginPage;
