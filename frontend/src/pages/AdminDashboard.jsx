import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminDashboard({ auth, showToast }) {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    // Check if user is admin
    if (!auth.user || auth.user.role !== 'ADMIN') {
      navigate('/admin-login')
      return
    }
    
    fetchDashboardData()
  }, [auth, navigate])

  const fetchDashboardData = () => {
    setLoading(true)
    
    // Fetch stats
    axios.get('/api/admin/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(r => setStats(r.data))
      .catch(err => showToast('Failed to fetch statistics', 'error'))

    // Fetch applications
    fetchApplications(0, statusFilter)
  }

  const fetchApplications = (page, status) => {
    let url = `/api/admin/applications?page=${page}&size=${pageSize}`
    if (status) {
      url += `&status=${status}`
    }

    axios.get(url, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(r => {
        setApplications(r.data.content)
        setCurrentPage(r.data.currentPage)
        setTotalPages(r.data.totalPages)
        setLoading(false)
      })
      .catch(err => {
        showToast('Failed to fetch applications', 'error')
        setLoading(false)
      })
  }

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus)
    setCurrentPage(0)
    fetchApplications(0, newStatus)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      fetchApplications(newPage, statusFilter)
    }
  }

  const handleViewDetails = (appId) => {
    navigate(`/admin-application/${appId}`)
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

  if (loading && !stats) {
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

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Total Applications</h5>
                <h2 className="text-primary">{stats.totalApplications}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <h2 className="text-warning">{stats.pendingApplications}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Approved</h5>
                <h2 className="text-success">{stats.approvedApplications}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Rejected</h5>
                <h2 className="text-danger">{stats.rejectedApplications}</h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label mb-0">Filter by Status:</label>
            </div>
            <div className="col-md-6">
              <div className="btn-group w-100" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleStatusFilterChange('')}
                >
                  All
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => handleStatusFilterChange('PENDING')}
                >
                  Pending
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${statusFilter === 'IN_PROGRESS' ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => handleStatusFilterChange('IN_PROGRESS')}
                >
                  In Progress
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${statusFilter === 'APPROVED' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => handleStatusFilterChange('APPROVED')}
                >
                  Approved
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${statusFilter === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleStatusFilterChange('REJECTED')}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Service Applications</h5>
        </div>
        <div className="card-body">
          {applications.length === 0 ? (
            <div className="alert alert-info">No applications found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Application ID</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Application Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>#{app.id}</td>
                      <td>{app.userName}</td>
                      <td>{app.userEmail}</td>
                      <td>{app.serviceName}</td>
                      <td>{app.department}</td>
                      <td>
                        <span className={getStatusBadgeClass(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewDetails(app.id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <nav className="mt-3" aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
