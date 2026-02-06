import { Button } from 'primereact/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {  confirmDialog } from 'primereact/confirmdialog';


interface HeaderProps {
  pageTitle: string
  onMobileMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMobileMenuToggle }) => {
  const navigate = useNavigate()
  
  const logout = () => {
    confirmDialog({
        message: 'Are you sure you want to sign out?',
        header: 'Sign Out Confirmation',
        icon: 'pi pi-power-off',
        acceptClassName: 'p-button-danger',
        acceptLabel: 'Sign Out',
        rejectLabel: 'Cancel',
        accept: () => {
            localStorage.removeItem('token')
            navigate('/login')
        }
    });
  }
  return (
    <div className="fixed top-0 right-0 left-0 sm:left-64 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 h-16">
            <div className="lg:hidden flex items-center gap-4">
                <Button 
                    icon="pi pi-bars" 
                    className="p-button-text sm:hidden text-slate-600" 
                    onClick={onMobileMenuToggle}
                    aria-label="Menu"
                />
               
            </div>

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
