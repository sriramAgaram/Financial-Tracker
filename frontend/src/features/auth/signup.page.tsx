import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { InputText } from "primereact/inputtext";
import { selectSignupSuccess, selectIsLoading } from "./redux/authSlice";
import { signupActions } from "./redux/authSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { signupSchema } from "./services/schema";

interface SignupFormValues {
    name: string;
    username: string;
    password: string;
}

const SignUpPage: React.FC = () => {
    const dispatch = useDispatch();
    const signupSuccess = useAppSelector(selectSignupSuccess);
    const isLoading = useAppSelector(selectIsLoading);
    const navigate = useNavigate();

    const initialValues: SignupFormValues = {
        name: '',
        username: '',
        password: ''
    };

    useEffect(() => {
        if (signupSuccess) {
            navigate('/login');
        }
    }, [signupSuccess, navigate]);

    const handleSubmit = (values: SignupFormValues) => {
        dispatch(signupActions.request({
            username: values.username,
            password: values.password,
            name: values.name
        }));
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={signupSchema}
            onSubmit={handleSubmit}
        >
            {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/50">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                                Create Account
                            </h1>
                            <p className="text-slate-500 mt-2 text-sm">Join us to get started</p>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Name Field */}
                            <div className="w-full">
                                <span className="p-float-label w-full block">
                                    <InputText
                                        name="name"
                                        id="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={errors.name && touched.name ? 'p-invalid w-full' : 'w-full'}
                                    />
                                    <label htmlFor="name" className="text-slate-500">Name</label>
                                </span>
                                {errors.name && touched.name && (
                                    <small className="text-red-500 text-xs mt-1 block">{errors.name}</small>
                                )}
                            </div>

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
                                {isLoading ? 'Signing Up...' : 'Sign Up'}
                            </button>

                            <div className="text-center mt-2">
                                <span className="text-slate-500 text-sm">Already have an account? </span>
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default SignUpPage;