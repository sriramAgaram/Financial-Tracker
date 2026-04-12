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
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
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

      <main className="flex-1 overflow-y-auto pt-20 px-4 sm:px-6 lg:px-8 pb-8 transition-all duration-300 sm:ml-64">
        <div className="max-w-7xl mx-auto h-full">
            <Outlet/>
        </div>
      </main>
    </div>

  )
}

export default Layout
