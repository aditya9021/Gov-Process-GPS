import React, { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    axios.post('/api/auth/login', { email, password })
      .then(r => setMessage('Logged in (demo). Token: ' + JSON.stringify(r.data.token)))
      .catch(err => setMessage('Login failed'))
  }

  return (
    <div className="col-md-6">
      <h2>Login (demo)</h2>
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
