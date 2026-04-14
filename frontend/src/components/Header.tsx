import React, { useState } from 'react'
import { Menu, User } from 'lucide-react'
import ProfileDropdown from '../features/home/components/ProfileDropdown'

interface HeaderProps {
  pageTitle: string
  onMobileMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  return (
    <div className="fixed top-0 right-0 left-0 sm:left-64 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300 h-16">
        <div className="flex items-center justify-between px-6 py-3 h-full">
            {/* Left: Hamburger Only */}
            <div className="flex items-center">
                <button 
                    onClick={onMobileMenuToggle}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 sm:hidden"
                    aria-label="Menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Right: Profile with Integrated Dropdown */}
            <div className="flex items-center gap-1 relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:border-red-600/50 hover:bg-white transition-all overflow-hidden focus:ring-2 focus:ring-red-600/20"
                >
                  <User size={20} className="text-slate-500" />
                </button>
                
                <ProfileDropdown 
                  isOpen={showProfileMenu} 
                  onClose={() => setShowProfileMenu(false)} 
                />
            </div>
        </div>
    </div>
  )
}

export default Header

