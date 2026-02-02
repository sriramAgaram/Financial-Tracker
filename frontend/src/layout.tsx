import { Outlet } from "react-router-dom"
import SideBar from "./components/SideBar"
import Header from "./components/Header"

interface LayoutProps {
  pageTitle: string
}

const Layout: React.FC<LayoutProps> = ({ pageTitle }) => {
  return (
    <div>
        <SideBar />
        <Header pageTitle={pageTitle} />
        <div className="pt-16 pl-64">
            <Outlet/>
        </div>
    </div>
  )
}

export default Layout
