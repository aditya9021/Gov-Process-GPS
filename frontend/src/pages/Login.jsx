import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login({ onLogin, showToast }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    axios.post('/api/auth/login', { email, password })
      .then(r => {
        const token = r.data.token
        const user = r.data.user
        localStorage.removeItem('auth')
        localStorage.setItem('userAuth', JSON.stringify({ token, user }))
        if (typeof onLogin === 'function') {
          onLogin(user, token)
        }
        setEmail('')
        setPassword('')
        setMessage('Logged in successfully.')
        if (typeof showToast === 'function') {
          showToast('Logged in successfully.', 'success')
        }
        navigate('/')
      })
      .catch(err => {
        setMessage('Login failed')
        if (typeof showToast === 'function') {
          showToast('Login failed.', 'error')
        }
      })
  }

  return (
    <div className="col-md-6">
      <h2>Login</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  )
}
