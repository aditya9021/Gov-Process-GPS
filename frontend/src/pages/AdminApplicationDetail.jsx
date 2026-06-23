import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

export default function AdminApplicationDetail({ auth, showToast }) {
  const navigate = useNavigate()
  const { appId } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [certificateFile, setCertificateFile] = useState(null)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)

  useEffect(() => {
    if (!auth.user || auth.user.role !== 'ADMIN') {
      navigate('/admin-login')
      return
    }
    
    fetchApplicationDetails()
  }, [appId, auth, navigate])

  const fetchApplicationDocuments = (applicationId) => {
    setDocsLoading(true)
    axios.get(`/api/files/application/${applicationId}`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(r => {
        setDocuments(Array.isArray(r.data) ? r.data : [])
      })
      .catch(err => {
        showToast('Failed to fetch application documents', 'error')
        setDocuments([])
      })
      .finally(() => setDocsLoading(false))
  }

  const fetchApplicationDetails = () => {
    setLoading(true)
    axios.get(`/api/admin/applications/${appId}`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(r => {
        setApplication(r.data)
        setSelectedStatus(r.data.status)
        setAdminNotes(r.data.adminNotes || '')
        setRejectionReason(r.data.rejectionReason || '')
        fetchApplicationDocuments(r.data.id)
        setLoading(false)
      })
      .catch(err => {
        showToast('Failed to fetch application details', 'error')
        setLoading(false)
      })
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      showToast('Please select a status', 'error')
      return
    }

    if (selectedStatus === 'REJECTED' && !rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error')
      return
    }

    if (selectedStatus === 'APPROVED' && !certificateFile) {
      showToast('Please upload the approval certificate before approving', 'error')
      return
    }

    setUpdating(true)
    try {
      let certificateFileId = null

      if (selectedStatus === 'APPROVED') {
        const formData = new FormData()
        formData.append('file', certificateFile)

        const uploadResponse = await axios.post('/api/admin/files/upload-certificate', formData, {
          params: { applicationId: appId },
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        })

        certificateFileId = uploadResponse.data.fileId
      }

      const statusPayload = {
        status: selectedStatus,
        adminNotes: adminNotes,
        rejectionReason: selectedStatus === 'REJECTED' ? rejectionReason : null,
        certificateFileId: certificateFileId
      }

      const statusUpdateResponse = await axios.put(`/api/admin/applications/${appId}/status`, statusPayload, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })

      const updatedApplication = statusUpdateResponse.data.application

      setCertificateFile(null)
      setApplication(updatedApplication)
      setShowStatusModal(false)
      fetchApplicationDetails()
      showToast('Status updated successfully', 'success')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      showToast('Please select a certificate file', 'error')
      return
    }

    if (application.status !== 'APPROVED') {
      showToast('Certificate can only be uploaded for approved applications', 'error')
      return
    }

    setUploadingCert(true)
    const formData = new FormData()
    formData.append('file', certificateFile)

    try {
      const response = await axios.post('/api/admin/files/upload-certificate', formData, {
        params: { applicationId: appId },
        headers: { 
          'Authorization': `Bearer ${auth.token}`
        }
      })

      // Update application with certificate file ID (sent as request param)
      await axios.post(`/api/admin/applications/${appId}/certificate`, null, {
        params: { certificateFileId: response.data.fileId },
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })

      setCertificateFile(null)
      fetchApplicationDetails()
      showToast('Certificate uploaded successfully', 'success')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to upload certificate', 'error')
    } finally {
      setUploadingCert(false)
    }
  }

  const handleDeleteApplication = () => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return
    }

    axios.delete(`/api/admin/applications/${appId}`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(r => {
        showToast('Application deleted successfully', 'success')
        navigate('/admin-dashboard')
      })
      .catch(err => {
        showToast('Failed to delete application', 'error')
      })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge bg-warning'
      case 'IN_PROGRESS': return 'badge bg-info'
      case 'APPROVED': return 'badge bg-success'
      case 'REJECTED': return 'badge bg-danger'
      default: return 'badge bg-secondary'
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Application not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="row gy-4">
        <div className="col-md-8">
          {/* Application Information Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h4 className="mb-0">
                Application #{application.id}
                <span className={`${getStatusBadgeClass(application.status)} ms-3`}>
                  {application.status}
                </span>
              </h4>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6 className="text-muted">Application Date</h6>
                  <p>{new Date(application.applicationDate).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Last Updated</h6>
                  <p>{new Date(application.updatedDate).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">User Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted">Full Name</h6>
                  <p>{application.userName}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Email</h6>
                  <p>{application.userEmail}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted">Mobile</h6>
                  <p>{application.userMobile || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">User ID</h6>
                  <p>#{application.userId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Information Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Service Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted">Service Name</h6>
                  <p>{application.serviceName}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted">Department</h6>
                  <p>{application.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Card */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Uploaded Documents</h5>
            </div>
            <div className="card-body">
              {docsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading documents...</span>
                  </div>
                </div>
              ) : documents.filter(doc => String(doc.id) !== String(application.certificateFileId)).length === 0 ? (
                <div className="alert alert-secondary mb-0">
                  No documents have been uploaded for this application yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>File Name</th>
                        <th>Uploaded At</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents
                        .filter(doc => String(doc.id) !== String(application.certificateFileId))
                        .map(doc => (
                          <tr key={doc.id}>
                            <td>{doc.documentName || doc.originalName}</td>
                            <td>{doc.originalName}</td>
                            <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'N/A'}</td>
                            <td>
                              <a
                                href={`/api/files/download/${doc.id}`}
                                className="btn btn-sm btn-outline-primary"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes Card */}
          {(application.adminNotes || application.rejectionReason) && (
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Admin Information</h5>
              </div>
              <div className="card-body">
                {application.adminNotes && (
                  <div className="mb-3">
                    <h6 className="text-muted">Admin Notes</h6>
                    <p>{application.adminNotes}</p>
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <h6 className="text-muted">Rejection Reason</h6>
                    <p className="text-danger">{application.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certificate Section */}
          {application.status === 'APPROVED' && (
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">Certificate</h5>
              </div>
              <div className="card-body">
                {application.certificateFileId ? (
                  <div>
                    <div className="alert alert-success">
                      ✓ Certificate has been uploaded
                    </div>
                    <a 
                      href={`/api/admin/files/${application.certificateFileId}/download`}
                      className="btn btn-primary"
                      download
                    >
                      Download Certificate
                    </a>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted">No certificate uploaded yet</p>
                    <div className="mb-3">
                      <label className="form-label">Upload Certificate</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <small className="text-muted d-block mt-2">
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 50MB)
                      </small>
                    </div>
                    <button 
                      className="btn btn-success"
                      onClick={handleUploadCertificate}
                      disabled={uploadingCert}
                    >
                      {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={() => setShowStatusModal(true)}
              >
                Update Status
              </button>
              {/* Delete action removed from UI per product decision; backend DELETE endpoint remains available */}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal show d-block" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Application Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Select Status...</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Admin Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes..."
                  />
                </div>

                {selectedStatus === 'APPROVED' && (
                  <div className="mb-3">
                    <label className="form-label">
                      Upload Issued Certificate <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                    />
                    <small className="text-muted d-block mt-2">
                      Required: upload the approval certificate before saving approval.
                    </small>
                  </div>
                )}

                {selectedStatus === 'REJECTED' && (
                  <div className="mb-3">
                    <label className="form-label">Rejection Reason (Required)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the application is rejected..."
                      required
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
