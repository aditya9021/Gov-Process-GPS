import React, { useState } from 'react'
import axios from 'axios'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    axios.post('/api/auth/register', { name, email, mobile, password })
      .then(r => setMessage('Registered: ' + r.data.email))
      .catch(err => setMessage('Registration failed'))
  }

  return (
    <div className="col-md-6">
      <h2>Register (demo)</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Full name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Mobile</label><input className="form-control" value={mobile} onChange={e=>setMobile(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  )
}
