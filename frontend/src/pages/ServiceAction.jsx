import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ServiceAction(){
  const { id, action } = useParams()
  const title = action === 'apply' ? 'Apply for Service' : 'Learn about Service'
  return (
    <div>
      <h2>{title}</h2>
      <p className="text-muted">This is a sample page for <strong>{action}</strong> on service <strong>#{id}</strong>. Use this page to implement the real workflow.</p>
      <div className="mt-3">
        <Link to={`/services/${id}`} className="btn btn-outline-primary me-2">Back to service</Link>
        <Link to="/" className="btn btn-link">Home</Link>
      </div>
    </div>
  )
}
