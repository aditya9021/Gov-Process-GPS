import React, { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import ServiceList from './pages/ServiceList'
import ServiceDetail from './pages/ServiceDetail'
import ServiceAction from './pages/ServiceAction'
import Login from './pages/Login'
import Register from './pages/Register'
import SavedServices from './pages/SavedServices'
import AppliedServices from './pages/AppliedServices'

export default function App() {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const [dark, setDark] = useState(false)
  const [auth, setAuth] = useState({ user: null, token: null })
  const [profileOpen, setProfileOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, message, type }])
    window.setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4200)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')

    const savedAuth = localStorage.getItem('auth')
    if (savedAuth) {
      try {
        setAuth(JSON.parse(savedAuth))
      } catch (error) {
        localStorage.removeItem('auth')
      }
    }
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

  function handleLogin(user, token) {
    const nextAuth = { user, token }
    setAuth(nextAuth)
    localStorage.setItem('auth', JSON.stringify(nextAuth))
  }

  function handleLogout() {
    setAuth({ user: null, token: null })
    localStorage.removeItem('auth')
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
          <Link to="/applied-services">Applied</Link>
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
              {auth.user ? (auth.user.name ? auth.user.name.charAt(0).toUpperCase() : auth.user.email.charAt(0).toUpperCase()) : '👤'}
            </button>
            <div className={`user-dropdown-menu${profileOpen ? ' show' : ''}`}>
              <div className="user-dropdown-header">
                {auth.user ? `Signed in as ${auth.user.name || auth.user.email}` : 'Not signed in'}
              </div>
              {auth.user ? (
                <button type="button" className="user-dropdown-item" onClick={() => { handleLogout(); setProfileOpen(false) }}>
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
        <Route path="/" element={<ServiceList auth={auth} showToast={showToast} />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/services/:id/:action" element={<ServiceAction />} />
        <Route path="/saved" element={<SavedServices />} />
        <Route path="/applied-services" element={<AppliedServices auth={auth} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} showToast={showToast} />} />
        <Route path="/register" element={<Register showToast={showToast} />} />
      </Routes>
    </div>
  )
}
