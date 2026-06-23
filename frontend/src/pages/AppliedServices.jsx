import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function AppliedServices({ auth }) {
  const [appliedServices, setAppliedServices] = useState([])
  const [expandedDocs, setExpandedDocs] = useState({})
  const [expandedReason, setExpandedReason] = useState({})
  useEffect(() => {
    if (!auth?.user) {
      setAppliedServices([])
      return
    }

    const key = `appliedServices_${auth.user.id}`

    axios.get('/api/applications/my', {
      params: {
        userId: auth.user.id,
        page: 0,
        size: 50
      }
    }).then(async res => {
      const backendApps = Array.isArray(res.data.applications) ? res.data.applications : []
      if (backendApps.length > 0) {
        // Map basic app fields (include applicationId)
        const mapped = backendApps.map(app => ({
          applicationId: app.id,
          serviceId: app.serviceId,
          serviceName: app.serviceName,
          department: app.department,
          category: app.department || 'Service',
          submittedAt: app.applicationDate,
          status: app.status === 'PENDING' ? 'Submitted' : app.status,
          rejectionReason: app.rejectionReason,
          certificateFileId: app.certificateFileId,
          documents: [
            ...(app.certificateFileId ? [{
              id: `cert-${app.certificateFileId}`,
              name: 'Official Certificate',
              fileName: 'certificate',
              uploaded: true,
              uploadedAt: null,
              backendFileId: app.certificateFileId
            }] : [])
          ]
        }))

        // Fetch files for each service and attach those uploaded by current user
        try {
          const withDocs = await Promise.all(mapped.map(async item => {
            try {
              const resp = await axios.get(`/api/files/application/${item.applicationId}`, {
                headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}
              })
              const files = Array.isArray(resp.data) ? resp.data : []
              const userFiles = files.filter(f => String(f.uploadedBy) === String(auth.user.id))
              const certificateFile = item.certificateFileId
                ? files.find(f => String(f.id) === String(item.certificateFileId))
                : null
              const baseFiles = userFiles.length > 0 ? [...userFiles] : [...files]

              if (certificateFile && !baseFiles.some(f => String(f.id) === String(certificateFile.id))) {
                baseFiles.push(certificateFile)
              }

              const docs = baseFiles.map(f => ({
                id: f.id,
                name: f.documentName || f.originalName,
                fileName: f.originalName,
                uploaded: String(f.uploadedBy) === String(auth.user.id),
                uploadedAt: f.uploadedAt,
                backendFileId: f.id
              }))

              const existingFileIds = new Set(docs.map(d => String(d.backendFileId)))
              const certs = item.documents.filter(d => {
                if (!d || !String(d.id).startsWith('cert-')) return false
                const certId = String(d.id).replace(/^cert-/, '')
                return !existingFileIds.has(certId)
              })
              const otherExisting = item.documents.filter(d => !(d && String(d.id).startsWith('cert-')))
              return { ...item, documents: [...certs, ...otherExisting, ...docs] }
            } catch (e) {
              return item
            }
          }))
          setAppliedServices(withDocs)
        } catch (e) {
          setAppliedServices(mapped)
        }
      } else {
        const stored = JSON.parse(localStorage.getItem(key) || '[]')
        setAppliedServices(stored)
      }
    }).catch(() => {
      const stored = JSON.parse(localStorage.getItem(key) || '[]')
      setAppliedServices(stored)
    })
  }, [auth])

  const toggleDocuments = (key) => {
    setExpandedDocs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleReason = (key) => {
    setExpandedReason(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getStatusBadgeClass = (status) => {
    switch (String(status).toUpperCase()) {
      case 'SUBMITTED': return 'badge bg-warning'
      case 'IN PROGRESS': return 'badge bg-info'
      case 'IN REVIEW': return 'badge bg-info'
      case 'APPROVED': return 'badge bg-success'
      case 'REJECTED': return 'badge bg-danger'
      default: return 'badge bg-secondary'
    }
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
        <div className="row g-4 align-items-start applied-services-grid">
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
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  </div>
                  <div className="applied-card-details">
                    <p className="mb-1"><strong>Primary applicant:</strong> {item.data?.applicantName || item.data?.businessName || 'Not provided'}</p>
                    <p className="mb-0 text-muted">{item.data?.dateOfBirth ? `DOB: ${item.data.dateOfBirth}` : item.data?.licenseNumber ? `License: ${item.data.licenseNumber}` : ''}</p>
                  </div>
                  {item.status?.toUpperCase() === 'REJECTED' && item.rejectionReason && (
                    <div className="rejection-reason-wrapper">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rejection-reason-toggle"
                        onClick={() => toggleReason(docKey)}
                      >
                        {expandedReason[docKey] ? 'Hide rejection reason' : 'View rejection reason'}
                      </button>
                      {expandedReason[docKey] && (
                        <div className="rejection-reason-box">
                          {item.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                  {item.documents && (
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
                          {item.documents.length === 0 ? (
                            <div className="document-item">
                              <div className="document-info">
                                <span className="document-name text-muted">No uploaded documents</span>
                              </div>
                            </div>
                          ) : (
                            item.documents.map(doc => (
                              <div key={doc.id} className="document-item">
                                <div className="document-info">
                                  <span className="document-name">{doc.name}</span>
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
                            ))
                          )}
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
