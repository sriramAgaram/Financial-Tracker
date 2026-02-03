import { useState } from "react"
import { Outlet } from "react-router-dom"
import SideBar from "./components/SideBar"
import Header from "./components/Header"

interface LayoutProps {
  pageTitle: string
}

const Layout: React.FC<LayoutProps> = ({ pageTitle }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      <Header 
        pageTitle={pageTitle} 
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
      />
      
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm sm:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8 transition-all duration-300 sm:pl-72">
        <div className="max-w-7xl mx-auto">
            <Outlet/>
        </div>
      </main>
    </div>
  )
}

export default Layout
