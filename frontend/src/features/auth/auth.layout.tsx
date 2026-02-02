import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-indigo-100 via-purple-50 to-teal-50 flex items-center justify-center p-4">
        <Outlet/>
    </div>
  )
}

export default AuthLayout