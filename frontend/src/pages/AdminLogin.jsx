import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLogin({ onLogin, showToast }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    axios.post('/api/auth/login', { email, password })
      .then(r => {
        const token = r.data.token
        const user = r.data.user

        // Check if user is admin
        if (user.role !== 'ADMIN') {
          setMessage('Access denied. Admin credentials required.')
          showToast('Access denied. Admin credentials required.', 'error')
          setLoading(false)
          return
        }

        localStorage.removeItem('auth')
        localStorage.setItem('adminAuth', JSON.stringify({ token, user }))
        if (typeof onLogin === 'function') {
          onLogin(user, token)
        }
        setEmail('')
        setPassword('')
        showToast('Admin logged in successfully.', 'success')
        navigate('/admin-dashboard')
      })
      .catch(err => {
        const errorMsg = err.response?.data?.error || 'Login failed'
        setMessage(errorMsg)
        showToast(errorMsg, 'error')
        setLoading(false)
      })
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="mb-4 text-center">Admin Login</h2>
              {message && <div className="alert alert-danger alert-dismissible fade show">{message}</div>}
              
              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email"
                    name="username"
                    autoComplete="username"
                    className="form-control" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Enter admin email"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    name="current-password"
                    autoComplete="current-password"
                    className="form-control" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </div>
                
                <button 
                  className="btn btn-primary w-100" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login as Admin'}
                </button>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">Contact system administrator for credentials</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
