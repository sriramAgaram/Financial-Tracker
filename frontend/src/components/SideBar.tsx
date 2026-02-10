import { Link } from "react-router-dom"
import { useAppSelector } from "../hooks/useAppSelector"
import { selectIsAuthenticated } from "../features/auth/redux/authSlice"
import { Fragment } from "react/jsx-runtime"

interface SideBarProps {
    isMobileOpen?: boolean
    onClose?: () => void
}

const SideBar = ({ isMobileOpen, onClose }: SideBarProps) => {

    const isLogged = useAppSelector(selectIsAuthenticated)

    // Close sidebar when a link is clicked on mobile
    const handleLinkClick = () => {
        if (onClose) onClose();
    }

    return (
        <div>
            <aside
                id="logo-sidebar"
                className={`
                    fixed top-0 left-0 z-40 w-64 h-full pt-0 bg-neutral-primary-soft border-e border-default
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                    sm:translate-x-0
                `}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto">
                    {/* <h1>Logo</h1> */}
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link to="/" onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                <svg className="w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" /></svg>
                                <span className="ms-3 font-medium">Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link to='/settings' onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                <svg className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v14M9 5v14M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
                                <span className="flex-1 ms-3 whitespace-nowrap font-medium">Settings</span>
                                {/* <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-0.5 rounded-full">Pro</span> */}
                            </Link>
                        </li>
                        <li>
                            <Link to='/lists' onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                <svg className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h3.439a.991.991 0 0 1 .908.6 3.978 3.978 0 0 0 7.306 0 .99.99 0 0 1 .908-.6H20M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 13l2-9h12l2 9M9 7h6m-7 3h8" /></svg>
                                <span className="flex-1 ms-3 whitespace-nowrap font-medium">Lists</span>
                                {/* <span className="inline-flex items-center justify-center w-5 h-5 ms-2 text-xs font-semibold text-white bg-red-500 rounded-full shadow-sm">2</span> */}
                            </Link>
                        </li>
                        <li>
                            <Link to='/dashboard' onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                               <svg className="w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" /><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" /></svg>
                               <span className="flex-1 ms-3 whitespace-nowrap font-medium">Dashboard</span>
                            </Link>
                        </li>
                        {!isLogged && (
                            <Fragment>
                                <li>
                                    <Link to='/login' onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                        <svg className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                        <span className="flex-1 ms-3 whitespace-nowrap font-medium">Login</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to='/signup' onClick={handleLinkClick} className="flex items-center px-4 py-3 text-body rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                        <svg className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-indigo-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z" /></svg>
                                        <span className="flex-1 ms-3 whitespace-nowrap font-medium">Signup</span>
                                    </Link>
                                </li>
                            </Fragment>

                        )}

                    </ul>
                </div>
            </aside>
        </div>

    )
}

export default SideBar