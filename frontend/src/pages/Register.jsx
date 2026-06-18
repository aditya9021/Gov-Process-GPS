import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const emailPattern = /^\S+@\S+\.\S+$/
const mobilePattern = /^[0-9]{10}$/

export default function Register({ showToast }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const validationErrors = {}
    if (!name.trim()) validationErrors.name = 'Full name is required'
    if (!email.trim()) validationErrors.email = 'Email is required'
    else if (!emailPattern.test(email.trim())) validationErrors.email = 'Enter a valid email address'
    if (!mobile.trim()) validationErrors.mobile = 'Mobile number is required'
    else if (!mobilePattern.test(mobile.trim())) validationErrors.mobile = 'Mobile must be 10 digits'

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const submit = (e) => {
    e.preventDefault()
    setMessage(null)
    if (!validate()) {
      if (typeof showToast === 'function') {
        showToast('Please fix validation errors.', 'error')
      }
      return
    }

    axios.post('/api/auth/register', {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      password,
    })
      .then(() => {
        setName('')
        setEmail('')
        setMobile('')
        setPassword('')
        setErrors({})
        setMessage('Registration successful. Redirecting to login...')
        if (typeof showToast === 'function') {
          showToast('Registration successful.', 'success')
        }
        navigate('/login')
      })
      .catch(err => {
        const response = err?.response?.data
        const apiErrors = response?.errors || {}
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors)
          setMessage('Registration failed due to validation errors.')
        } else if (response?.error) {
          setMessage(response.error)
        } else {
          setMessage('Registration failed. Please try again.')
        }
        if (typeof showToast === 'function') {
          showToast('Registration failed.', 'error')
        }
      })
  }

  return (
    <div className="col-md-6">
      <h2>Register</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label">Full name</label>
          <input
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Mobile</label>
          <input
            className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
            value={mobile}
            onChange={e => setMobile(e.target.value)}
          />
          {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  )
}
