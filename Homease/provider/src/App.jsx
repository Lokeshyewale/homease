import React, { useContext } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ActiveJob from './pages/ActiveJob'
import Profile from './pages/Profile'
import { ProviderContext } from './context/ProviderContext'

const App = () => {
  const { token } = useContext(ProviderContext)

  return (
    <div className='app' style={{ backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      {token && <Navbar />}
      <div style={{ display: 'flex' }}>
        {token && (
          <div className="sidebar" style={sidebarStyle}>
            <NavLink to="/" style={({ isActive }) => (isActive ? activeSideBtn : sideBtn)}>
              <span style={iconPlaceholder}>📋</span> Job Requests
            </NavLink>
            <NavLink to="/active-job" style={({ isActive }) => (isActive ? activeSideBtn : sideBtn)}>
              <span style={iconPlaceholder}>⚡</span> Active Jobs
            </NavLink>
            <NavLink to="/dashboard" style={({ isActive }) => (isActive ? activeSideBtn : sideBtn)}>
              <span style={iconPlaceholder}>📊</span> Dashboard
            </NavLink>
            <NavLink to="/profile" style={({ isActive }) => (isActive ? activeSideBtn : sideBtn)}>
              <span style={iconPlaceholder}>👤</span> My Profile
            </NavLink>

            <div style={sidebarFooter}>
              <div style={proBadge}>Provider Portal</div>
            </div>
          </div>
        )}
        <div className="content" style={{ flex: 1, marginLeft: token ? '240px' : '0', padding: '20px' }}>
          <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/active-job" element={token ? <ActiveJob /> : <Navigate to="/login" />} />
            <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

const sidebarStyle = {
  position: 'fixed',
  left: 0,
  top: '70px',
  bottom: 0,
  width: '240px',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 15px',
  gap: '12px',
  boxShadow: '2px 0 5px rgba(0,0,0,0.02)'
};

const iconPlaceholder = {
  marginRight: '12px',
  fontSize: '18px'
};

const sideBtn = {
  display: 'flex',
  alignItems: 'center',
  padding: '14px 20px',
  textDecoration: 'none',
  color: '#4b5563',
  fontSize: '16px',
  fontWeight: '500',
  borderRadius: '10px',
  transition: 'all 0.3s ease'
};

const activeSideBtn = {
  ...sideBtn,
  backgroundColor: '#eff6ff',
  color: '#1a237e',
  fontWeight: '600',
  boxShadow: 'inset 4px 0 0 #1a237e'
};

const sidebarFooter = {
  marginTop: 'auto',
  padding: '20px 10px',
  textAlign: 'center'
};

const proBadge = {
  backgroundColor: '#1a237e',
  color: 'white',
  padding: '8px 15px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

export default App
