import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import ServiceList from './pages/ServiceList'
import ServiceDetail from './pages/ServiceDetail'
import ServiceAction from './pages/ServiceAction'
import Login from './pages/Login'
import Register from './pages/Register'
import SavedServices from './pages/SavedServices'
import AppliedServices from './pages/AppliedServices'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplicationDetail from './pages/AdminApplicationDetail'

function loadAuth(key) {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }
  const saved = localStorage.getItem(key)
  if (!saved) {
    return { user: null, token: null }
  }
  try {
    return JSON.parse(saved)
  } catch (error) {
    localStorage.removeItem(key)
    return { user: null, token: null }
  }
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)
  const [dark, setDark] = useState(false)
  const [userAuth, setUserAuth] = useState(() => loadAuth('userAuth'))
  const [adminAuth, setAdminAuth] = useState(() => loadAuth('adminAuth'))
  const activeAuth = location.pathname.startsWith('/admin') ? adminAuth : userAuth
  const [profileOpen, setProfileOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, message, type }])
    window.setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4200)
  }

  useEffect(() => {
    // Remove legacy shared auth storage if it exists.
    if (localStorage.getItem('auth')) {
      localStorage.removeItem('auth')
    }
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (!profileOpen) return

    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [profileOpen])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  function handleLogin(user, token, isAdmin = false) {
    const nextAuth = { user, token }
    localStorage.removeItem('auth')
    if (isAdmin) {
      setAdminAuth(nextAuth)
      localStorage.setItem('adminAuth', JSON.stringify(nextAuth))
    } else {
      setUserAuth(nextAuth)
      localStorage.setItem('userAuth', JSON.stringify(nextAuth))
    }
  }

  function handleLogout(isAdmin = false) {
    if (isAdmin) {
      setAdminAuth({ user: null, token: null })
      localStorage.removeItem('adminAuth')
    } else {
      setUserAuth({ user: null, token: null })
      localStorage.removeItem('userAuth')
    }
    showToast('Logged out successfully.', 'success')
  }

  return (
    <div className="container py-4">
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
      <header className="site-header mb-4 d-flex justify-content-between align-items-center">
        <h1 className="mb-0"><Link to="/" className="text-decoration-none">Government Process GPS</Link></h1>
        <nav className="d-flex align-items-center gap-3">
          {activeAuth.user?.role === 'ADMIN' && (
            <Link to="/admin-dashboard" className="btn btn-sm btn-outline-primary">Admin Dashboard</Link>
          )}
          {activeAuth.user?.role !== 'ADMIN' && (
            <Link to="/applied-services">Applied</Link>
          )}
          <button onClick={toggleTheme} className="btn btn-sm btn-link theme-icon" aria-label="Toggle dark mode" title={dark ? 'Light Mode' : 'Dark Mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <div className="user-dropdown" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(open => !open)}
              className="user-avatar"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              {activeAuth.user ? (activeAuth.user.name ? activeAuth.user.name.charAt(0).toUpperCase() : activeAuth.user.email.charAt(0).toUpperCase()) : '👤'}
            </button>
            <div className={`user-dropdown-menu${profileOpen ? ' show' : ''}`}>
              <div className="user-dropdown-header">
                {activeAuth.user ? `Signed in as ${activeAuth.user.name || activeAuth.user.email}${activeAuth.user.role === 'ADMIN' ? ' (Admin)' : ''}` : 'Not signed in'}
              </div>
              {activeAuth.user ? (
                <button type="button" className="user-dropdown-item" onClick={() => { handleLogout(location.pathname.startsWith('/admin')); setProfileOpen(false) }}>
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="user-dropdown-item" onClick={() => setProfileOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="user-dropdown-item" onClick={() => setProfileOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<ServiceList auth={userAuth} showToast={showToast} />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/services/:id/:action" element={<ServiceAction />} />
        <Route path="/saved" element={<SavedServices />} />
        <Route path="/applied-services" element={<AppliedServices auth={userAuth} />} />
        <Route path="/login" element={<Login onLogin={(user, token) => handleLogin(user, token, false)} showToast={showToast} />} />
        <Route path="/register" element={<Register showToast={showToast} />} />
        
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin onLogin={(user, token) => handleLogin(user, token, true)} showToast={showToast} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard auth={adminAuth} showToast={showToast} />} />
        <Route path="/admin-application/:appId" element={<AdminApplicationDetail auth={adminAuth} showToast={showToast} />} />
      </Routes>
    </div>
  )
}
