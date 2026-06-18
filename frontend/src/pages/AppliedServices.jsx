import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function AppliedServices({ auth }) {
  const [appliedServices, setAppliedServices] = useState([])
  const [expandedDocs, setExpandedDocs] = useState({})
  useEffect(() => {
    if (!auth?.user) {
      setAppliedServices([])
      return
    }
    const key = `appliedServices_${auth.user.id}`
    const stored = JSON.parse(localStorage.getItem(key) || '[]')
    setAppliedServices(stored)
  }, [auth])

  const toggleDocuments = (key) => {
    setExpandedDocs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDownloadDocument = async (doc) => {
    const downloadId = doc.backendFileId || doc.fileId
    if (!downloadId) {
      alert('No download available for this document yet.')
      return
    }

    try {
      const response = await axios.get(`/api/files/download/${downloadId}`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const filename = doc.fileName || doc.name || 'download'
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Unable to download document. Please try again later.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Applied Services</h2>
          <p className="text-muted">Review services you have applied for, with submitted details and status.</p>
        </div>
        <Link to="/" className="btn btn-outline-secondary">Back to services</Link>
      </div>

      {(!auth?.user) ? (
        <div className="card p-4 text-center text-muted">
          <h5>Please login to view your applied services</h5>
          <p className="mb-0">Sign in first, then apply for a service to see it listed here.</p>
        </div>
      ) : appliedServices.length === 0 ? (
        <div className="card p-4 text-center text-muted">
          <h5>No applied services yet</h5>
          <p className="mb-0">Complete an application from the service list to see it here.</p>
        </div>
      ) : (
        <div className="row g-4 align-items-start">
          {appliedServices.map((item, index) => {
            // Use a compound key (serviceId + index) so multiple applications
            // for the same service render independently and toggles don't collide.
            const docKey = `${item.serviceId}-${index}`;
            const isExpanded = !!expandedDocs[docKey];
            return (
            <div className="col-lg-6 col-md-8" key={docKey}>
              <div className="card applied-service-card shadow-sm">
                <div className="card-body d-flex flex-column gap-3">
                  <div className="applied-card-header">
                    <div>
                      <h5 className="card-title mb-1">{item.serviceName}</h5>
                      <div className="applied-card-meta">
                        <span>{item.department}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <span className={`badge-status ${item.status === 'In review' ? 'status-review' : 'status-submitted'}`}>{item.status}</span>
                  </div>
                  <div className="applied-card-details">
                    <p className="mb-1"><strong>Primary applicant:</strong> {item.data?.applicantName || item.data?.businessName || 'Not provided'}</p>
                    <p className="mb-0 text-muted">{item.data?.dateOfBirth ? `DOB: ${item.data.dateOfBirth}` : item.data?.licenseNumber ? `License: ${item.data.licenseNumber}` : ''}</p>
                  </div>
                  {item.documents && item.documents.length > 0 && (
                    <div className="applied-card-documents">
                      <button 
                        onClick={() => toggleDocuments(docKey)}
                        className="documents-toggle"
                      >
                        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                        <span>📎 Uploaded Documents</span>
                        <span className="badge bg-info text-dark">{item.documents.filter(d => d.uploaded).length}/{item.documents.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="documents-list">
                          {item.documents.map(doc => (
                            <div key={doc.id} className="document-item">
                              <div className="document-info">
                                <span className="document-name">{doc.name}</span>
                                {doc.uploaded && <span className="document-status uploaded">✓ Uploaded</span>}
                                {!doc.uploaded && <span className="document-status pending">○ Pending</span>}
                              </div>
                              {doc.backendFileId ? (
                                <button 
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="btn btn-sm btn-link document-download"
                                  title={`Download ${doc.fileName}`}
                                >
                                  ⬇ {doc.fileName}
                                </button>
                              ) : (
                                <span className="text-muted small">Download not available</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-auto d-flex justify-content-start align-items-center flex-wrap gap-2">
                    <small className="text-muted">Submitted {new Date(item.submittedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
