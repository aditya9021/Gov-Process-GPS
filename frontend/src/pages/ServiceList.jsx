import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function debounce(fn, wait) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait) }
}

export default function ServiceList() {
  const demoServices = [
    { id: 1, name: 'Birth Certificate', description: 'Apply and download an official birth certificate.', department: 'Civic Services', estimatedDays: 3, category: 'Vital Records' },
    { id: 2, name: 'Start a Business', description: 'Register a new business and get required licences.', department: 'Commerce', estimatedDays: 10, category: 'Licensing' },
    { id: 3, name: 'Property Tax Payment', description: 'Pay property taxes online quickly and securely.', department: 'Finance', estimatedDays: 1, category: 'Payments' },
    { id: 4, name: 'Driver Licence Renewal', description: 'Renew your driver licence without visiting the office.', department: 'Transport', estimatedDays: 5, category: 'Licensing' },
    { id: 5, name: 'Voter Registration', description: 'Register to vote or update your voter details.', department: 'Elections', estimatedDays: 7, category: 'Registrations' },
    { id: 6, name: 'Business Subsidy Application', description: 'Apply for small business subsidies and grants.', department: 'Commerce', estimatedDays: 21, category: 'Support' }
  ]
  const [services, setServices] = useState(demoServices)
  const [query, setQuery] = useState('')

  useEffect(() => { fetchServices() }, [])

  const fetchServices = (q) => {
    const url = q ? `/api/services?query=${encodeURIComponent(q)}` : '/api/services'
    axios.get(url).then(res => {
      if (res.data && res.data.length) setServices(res.data)
      else setServices(demoServices)
    }).catch(err => {
      console.error(err)
      setServices(demoServices)
    })
  }

  const onSearch = useMemo(() => debounce((val) => fetchServices(val), 300), [])

  return (
    <div>
      <div className="hero mb-4">
        <div style={{display:'flex', flexWrap:'wrap', alignItems:'center', gap:20, width:'100%'}}>
          <div style={{flex:'1 1 260px', minWidth:0}}>
            <h2 className="mb-1">Find Government Services</h2>
            <p className="text-muted">Search by goal — e.g. "Start a shop", "Birth certificate"</p>
          </div>
          <div style={{flex:'0 1 360px', minWidth:0, width:'100%', maxWidth:360}}>
            <input className="form-control search-input" placeholder="What do you want to do today?" value={query} onChange={e => { setQuery(e.target.value); onSearch(e.target.value) }} />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Popular Services</h3>
        <Link to="/saved" className="text-decoration-none">Saved services</Link>
      </div>

      <div className="row g-3">
        {services.map(s => (
          <div className="col-12 col-sm-6 col-md-6 col-lg-4" key={s.id}>
            <Link to={`/services/${s.id}`} className="text-decoration-none text-dark">
              <div className="card service-card h-100">
                <div className="card-body d-flex gap-3">
                  <div className="service-thumb">
                    {s.image ? <img src={s.image} alt={s.name} /> : <div className="thumb-fallback">{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <h5 className="card-title">{s.name}</h5>
                    <p className="card-text text-truncate">{s.description}</p>
                    <div className="mt-2 d-flex gap-2 align-items-center">
                      <span className="badge-soft">{s.category || s.department}</span>
                      <span className="badge-days">{s.estimatedDays} days</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <small className="text-muted">{s.department}</small>
                  <small className="text-muted">&nbsp;</small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
