import { Button } from 'primereact/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'


interface HeaderProps {
  pageTitle: string
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <div className="fixed top-0 right-0 left-64 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 transaction-all duration-300">
        <div className="flex items-center justify-between px-8 py-4 h-16">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-600">
                {pageTitle}
            </h1>
            
            <Button 
                onClick={logout}
                className="p-button-text p-button-rounded hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                aria-label="Sign Out"
                tooltip="Sign Out"
                tooltipOptions={{ position: 'bottom' }}
            >
                <i className="pi pi-power-off text-lg" />
            </Button>
        </div>
    </div>
  )
}

export default Header
