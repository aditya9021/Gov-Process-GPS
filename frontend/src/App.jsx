import React, { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import ServiceList from './pages/ServiceList'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import SavedServices from './pages/SavedServices'

export default function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return (
    <div className="container py-4">
      <header className="site-header mb-4 d-flex justify-content-between align-items-center">
        <h1><Link to="/" className="text-decoration-none">Government Process GPS</Link></h1>
        <nav className="d-flex align-items-center">
          <button onClick={toggleTheme} className="btn btn-sm btn-link theme-icon" aria-label="Toggle dark mode" title={dark ? 'Light Mode' : 'Dark Mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="me-3">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>
      

      <Routes>
        <Route path="/" element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/saved" element={<SavedServices />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}
