import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetAuth } from './redux/authSlice';

const AuthLayout: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetAuth());
    return () => {
      dispatch(resetAuth());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-indigo-100 via-purple-50 to-teal-50 flex items-center justify-center p-4">
        <Outlet/>
    </div>
  )
}

export default AuthLayout