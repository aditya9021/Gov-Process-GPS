import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function SavedServices() {
  const [bookmarks, setBookmarks] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    // demo userId=1
    axios.get('/api/bookmarks/1').then(r => setBookmarks(r.data)).catch(() => setBookmarks([]))
  }, [])

  useEffect(() => {
    if (bookmarks.length === 0) return
    axios.get('/api/services').then(r => {
      const map = r.data.reduce((acc, s) => { acc[s.id] = s; return acc }, {})
      setServices(bookmarks.map(b => map[b.serviceId]).filter(Boolean))
    })
  }, [bookmarks])

  return (
    <div>
      <h2>Saved Services</h2>
      <div className="row g-3">
        {services.map(s => (
          <div className="col-md-6" key={s.id}>
            <Link to={`/services/${s.id}`} className="text-decoration-none text-dark">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{s.name}</h5>
                  <p className="card-text text-truncate">{s.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {services.length === 0 && <div className="col-12 text-muted">No saved services yet.</div>}
      </div>
    </div>
  )
}
