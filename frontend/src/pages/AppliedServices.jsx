import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const sampleAppliedServices = [
  {
    serviceId: 1,
    serviceName: 'Birth Certificate',
    department: 'Civic Services',
    category: 'Vital Records',
    submittedAt: '2026-06-12T14:20:00.000Z',
    status: 'Submitted',
    data: { applicantName: 'Asha Patel', dateOfBirth: '1998-09-18', placeOfBirth: 'Mumbai' },
    documents: [
      { id: 1, name: 'Birth Certificate Application Form', fileName: 'birth_cert_form.pdf', uploaded: true, uploadedAt: '2026-06-12T14:15:00.000Z' },
      { id: 2, name: 'Proof of Identity', fileName: 'identity_proof.jpg', uploaded: true, uploadedAt: '2026-06-12T14:16:00.000Z' },
      { id: 3, name: 'Proof of Birth', fileName: null, uploaded: false }
    ]
  },
  {
    serviceId: 4,
    serviceName: 'Driver Licence Renewal',
    department: 'Transport',
    category: 'Licensing',
    submittedAt: '2026-06-10T11:05:00.000Z',
    status: 'In review',
    data: { licenseNumber: 'DL-08-20210123', dateOfBirth: '1992-03-02' },
    documents: [
      { id: 9, name: 'Driver Licence Renewal Form', fileName: 'dl_renewal_form.pdf', uploaded: true, uploadedAt: '2026-06-10T11:00:00.000Z' },
      { id: 10, name: 'Expired Licence', fileName: 'expired_license.pdf', uploaded: true, uploadedAt: '2026-06-10T11:02:00.000Z' },
      { id: 11, name: 'Photo ID', fileName: 'photo_id.jpg', uploaded: true, uploadedAt: '2026-06-10T11:03:00.000Z' }
    ]
  }
]

export default function AppliedServices() {
  const [appliedServices, setAppliedServices] = useState([])
  const [expandedDocs, setExpandedDocs] = useState({})
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('appliedServices') || '[]')
    setAppliedServices(stored.length > 0 ? stored : sampleAppliedServices)
  }, [])

  const toggleDocuments = (key) => {
    setExpandedDocs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDownloadDocument = (doc) => {
    if (doc.fileName) {
      console.log(`Downloading: ${doc.fileName}`)
      // Mock download - in real app would fetch from server
      alert(`Document '${doc.fileName}' download started. (Mock)\n\nFile: ${doc.name}\nSize: ~2.5 MB`)
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

      {appliedServices.length === 0 ? (
        <div className="card p-4 text-center text-muted">
          <h5>No applied services yet</h5>
          <p className="mb-0">Complete an application from the service list to see it here.</p>
        </div>
      ) : (
        <div className="row g-4">
          {appliedServices.map((item, index) => {
            const docKey = `${item.serviceId}-${index}`;
            const isExpanded = expandedDocs[docKey];
            return (
            <div className="col-lg-6 col-md-8" key={docKey}>
              <div className="card applied-service-card h-100 shadow-sm">
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
                              {doc.uploaded && (
                                <button 
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="btn btn-sm btn-link document-download"
                                  title={`Download ${doc.fileName}`}
                                >
                                  ⬇ {doc.fileName}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-auto d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <small className="text-muted">Submitted {new Date(item.submittedAt).toLocaleDateString()}</small>
                    <Link to="/" className="btn btn-sm btn-primary">Apply again</Link>
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
