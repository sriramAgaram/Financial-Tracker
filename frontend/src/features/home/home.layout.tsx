import React from 'react'
import { Outlet } from 'react-router-dom'

const HomeLayout: React.FC = () => {
  return (
    <div>
      {/* You can add feature-specific layout elements here if needed */}
      <Outlet />
    </div>
  )
}

export default HomeLayout
