import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function debounce(fn, wait) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait) }
}

export default function ServiceList({ auth, showToast }) {
  const navigate = useNavigate()
  const useDemo = (import.meta.env && (import.meta.env.VITE_USE_DEMO === 'true' || import.meta.env.DEV)) || false
  const demoServices = [
    { id: 1, name: 'Birth Certificate', description: 'Apply and download an official birth certificate.', department: 'Civic Services', estimatedDays: 3, category: 'Vital Records' },
    { id: 2, name: 'Start a Business', description: 'Register a new business and get required licences.', department: 'Commerce', estimatedDays: 10, category: 'Licensing' },
    { id: 3, name: 'Property Tax Payment', description: 'Pay property taxes online quickly and securely.', department: 'Finance', estimatedDays: 1, category: 'Payments' },
    { id: 4, name: 'Driver Licence Renewal', description: 'Renew your driver licence without visiting the office.', department: 'Transport', estimatedDays: 5, category: 'Licensing' },
    { id: 5, name: 'Voter Registration', description: 'Register to vote or update your voter details.', department: 'Elections', estimatedDays: 7, category: 'Registrations' },
    { id: 6, name: 'Business Subsidy Application', description: 'Apply for small business subsidies and grants.', department: 'Commerce', estimatedDays: 21, category: 'Support' }
  ]

  // Added popular service records requested by the user
  demoServices.push(
    { id: 7, name: 'Caste Certificate', description: 'Apply for an official caste certificate for government records and benefits.', department: 'Social Welfare', estimatedDays: 14, category: 'Certificates' },
    { id: 8, name: 'PAN Card', description: 'Apply for a Permanent Account Number (PAN) card for taxation and identity.', department: 'Revenue', estimatedDays: 7, category: 'Identity' },
    { id: 9, name: 'Driving License', description: 'Apply for a new driving licence or learner permit.', department: 'Transport', estimatedDays: 21, category: 'Licensing' },
    { id: 10, name: 'Shop License', description: 'License to operate a shop in municipal limits.', department: 'Municipal Office', estimatedDays: 10, category: 'Licensing' }
  )
  const [services, setServices] = useState([])
  const [query, setQuery] = useState('')
  const [applyModalService, setApplyModalService] = useState(null)
  const [applyDocuments, setApplyDocuments] = useState([])
  const [applyForm, setApplyForm] = useState({})
  const [applySuccess, setApplySuccess] = useState(false)
  const [applyErrors, setApplyErrors] = useState([])

  useEffect(() => { fetchServices() }, [])

  useEffect(() => {
    document.body.style.overflow = applyModalService ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [applyModalService])

  const findDemoMatches = (q) => {
    if (!useDemo) return []
    const searchTerm = q.toLowerCase()
    return demoServices.filter(ds =>
      ds.name.toLowerCase().includes(searchTerm) ||
      ds.description.toLowerCase().includes(searchTerm) ||
      ds.department.toLowerCase().includes(searchTerm)
    )
  }

  const fetchServices = (q) => {
    const url = q ? `/api/services?query=${encodeURIComponent(q)}` : '/api/services'
    axios.get(url).then(res => {
      const backend = Array.isArray(res.data) ? res.data : []
      
      if (q) {
        // When searching, prefer backend results, otherwise search demo data (if enabled)
        setServices(backend.length > 0 ? backend : findDemoMatches(q))
      } else {
        // When no search, treat backend as authoritative. Use demo data only if backend is empty and demo mode is enabled.
        if (backend.length) {
          setServices(backend)
        } else if (useDemo) {
          setServices(demoServices)
        } else {
          setServices([])
        }
      }
    }).catch(err => {
      console.error(err)
      if (q) {
        setServices(findDemoMatches(q))
      } else {
        setServices(demoServices)
      }
    })
  }

  const onSearch = useMemo(() => debounce((val) => fetchServices(val), 300), [])

  function openApply(service){
    if (!auth?.user) {
      if (typeof showToast === 'function') {
        showToast('Please login to apply for services.', 'error')
      }
      navigate('/login')
      return
    }
    setApplyModalService(service)
    setApplyDocuments(getDocumentsForService(service.id, service.name).map(doc => ({ ...doc, attached: false, file: null })))
    setApplyForm(initApplyForm(service.id, service.name))
    setApplySuccess(false)
    setApplyErrors([])
  }

  function closeApply(){
    setApplyModalService(null)
    setApplyDocuments([])
    setApplySuccess(false)
    setApplyErrors([])
  }

  function updateApplyField(name, value){
    setApplyForm(prev => ({ ...prev, [name]: value }))
  }

  function updateApplyDocument(docId, file){
    if (file) {
      // Validate file type - only Word and PDF
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const validExtensions = ['.pdf', '.doc', '.docx']
      const fileName = file.name.toLowerCase()
      const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
      const isValidType = validTypes.includes(file.type) || isValidExtension
      
      if (!isValidType) {
        alert('Only Word (.doc, .docx) and PDF files are allowed.')
        return
      }
    }
    setApplyDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, attached: !!file, file } : doc))
  }

  function persistAppliedService(payload) {
    if (!auth?.user) return
    const key = `appliedServices_${auth.user.id}`
    const stored = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([payload, ...stored]))
  }

  function submitApply(e){
    e.preventDefault()
    const errors = []
    const fields = getApplyFieldsForService(applyModalService.id, applyModalService.name)
    fields.forEach(field => {
      if (field.required && !applyForm[field.name]) {
        errors.push(`${field.label} is required.`)
      }
    })
    applyDocuments.forEach(doc => {
      if (doc.mandatory && !doc.attached) {
        errors.push(`Please attach ${doc.name}.`)
      }
    })
    if (errors.length) {
      setApplyErrors(errors)
      if (typeof showToast === 'function') {
        showToast('Please fix the highlighted errors before submitting.', 'error')
      }
      return
    }

    // Create application first, then upload files against that application id
    axios.post('/api/applications', {}, {
      params: {
        userId: auth.user.id,
        serviceId: applyModalService.id
      }
    })
      .then(async (appRes) => {
        const applicationId = appRes?.data?.application?.id || null
        const uploadResults = await Promise.all(
          applyDocuments
            .filter(doc => doc.attached && doc.file)
            .map(doc =>
              new Promise(async (resolve) => {
                const formData = new FormData()
                formData.append('file', doc.file)
                formData.append('relatedServiceId', applyModalService.id)
                if (applicationId) {
                  formData.append('applicationId', applicationId)
                }
                formData.append('uploadedBy', auth?.user?.id || 1)
                formData.append('documentName', doc.name)
                formData.append('documentId', doc.id)

                try {
                  const response = await axios.post('/api/files/upload', formData)
                  resolve({ docId: doc.id, fileId: response.data.id, ...response.data })
                } catch (err) {
                  console.error('File upload failed:', err)
                  resolve({ docId: doc.id, error: err.message })
                }
              })
            )
        )

        const payload = {
          applicationId,
          serviceId: applyModalService?.id,
          serviceName: applyModalService?.name,
          department: applyModalService?.department,
          category: applyModalService?.category,
          submittedAt: new Date().toISOString(),
          status: 'Submitted',
          data: applyForm,
          documents: applyDocuments.map(d => {
            const uploadResult = uploadResults.find(r => r.docId === d.id)
            const success = !!(uploadResult?.fileId || uploadResult?.id) && !uploadResult?.error
            const fileId = uploadResult?.fileId || uploadResult?.id || null
            return {
              id: d.id,
              name: d.name,
              fileName: d.file ? d.file.name : null,
              uploaded: success,
              uploadedAt: success ? new Date().toISOString() : null,
              mandatory: d.mandatory,
              backendFileId: fileId,
              fileId
            }
          })
        }

        console.log('Application persisted to backend.')
        persistAppliedService(payload)
        console.log('Mock apply payload:', payload)
        setApplySuccess(true)
        if (typeof showToast === 'function') {
          showToast(`Applied for ${applyModalService.name} successfully.`, 'success')
        }
      })
      .catch(err => {
        console.error('Backend application persistence failed:', err)
        if (typeof showToast === 'function') {
          showToast('Failed to submit application.', 'error')
        }
      })
  }

  function getApplyFieldsForService(serviceId, serviceName){
    const fields = {
      1: [
        { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true }
      ],
      2: [
        { name: 'businessName', label: 'Business Name', type: 'text', required: true },
        { name: 'businessType', label: 'Business Type', type: 'select', options: ['Sole Proprietor', 'Partnership', 'LLC', 'Corporation'], required: true },
        { name: 'ownerName', label: 'Owner Name', type: 'text', required: true }
      ],
      3: [
        { name: 'propertyId', label: 'Property ID', type: 'text', required: true },
        { name: 'taxYear', label: 'Tax Year', type: 'text', required: true }
      ],
      4: [
        { name: 'licenseNumber', label: 'Current Licence Number', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true }
      ],
      5: [
        { name: 'nationalId', label: 'National ID Number', type: 'text', required: true },
        { name: 'address', label: 'Residential Address', type: 'text', required: true }
      ],
      6: [
        { name: 'businessName', label: 'Business Name', type: 'text', required: true },
        { name: 'subsidyAmount', label: 'Subsidy Amount', type: 'number', required: true }
      ],
      7: [
        { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
        { name: 'caste', label: 'Caste', type: 'text', required: true },
        { name: 'parentDetails', label: 'Parent Details', type: 'text', required: true }
      ],
      8: [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'mobile', label: 'Mobile Number', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true }
      ],
      9: [
        { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'address', label: 'Address', type: 'text', required: true },
        { name: 'licenseType', label: 'License Type', type: 'select', options: ['Learner', 'Permanent'], required: true }
      ],
      10: [
        { name: 'shopName', label: 'Shop Name', type: 'text', required: true },
        { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
        { name: 'ownerName', label: 'Owner Name', type: 'text', required: true }
      ],
      11: [
        { name: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
        { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { name: 'incomeSource', label: 'Income Source', type: 'text', required: true },
        { name: 'annualIncome', label: 'Annual Income', type: 'number', required: true }
      ]
    }
    if (fields[serviceId]) return fields[serviceId]
    if (serviceName) {
      const normalized = serviceName.toLowerCase()
      if (normalized.includes('shop')) {
        return fields[10]
      }
      if (normalized.includes('income')) {
        return fields[11]
      }
      if (normalized.includes('driving') || normalized.includes('licence') || normalized.includes('license')) {
        return fields[9]
      }
      if (normalized.includes('birth')) {
        return fields[1]
      }
      if (normalized.includes('business')) {
        return fields[2]
      }
    }
    return [{ name: 'applicantName', label: 'Applicant Name', type: 'text', required: true }]
  }

  function initApplyForm(serviceId, serviceName){
    return getApplyFieldsForService(serviceId, serviceName).reduce((form, field) => ({ ...form, [field.name]: '' }), {})
  }

  function getDocumentsForService(serviceId, serviceName){
    const docs = {
      1: [
        { id: 1, name: 'Birth Certificate Application Form', mandatory: true },
        { id: 2, name: 'Proof of Identity', mandatory: true },
        { id: 3, name: 'Proof of Birth', mandatory: false }
      ],
      2: [
        { id: 4, name: 'Business Registration Form', mandatory: true },
        { id: 5, name: 'Proof of Address', mandatory: true },
        { id: 6, name: 'Owner Identity Document', mandatory: true }
      ],
      3: [
        { id: 7, name: 'Property Tax Payment Form', mandatory: true },
        { id: 8, name: 'Bank Account Statement', mandatory: true }
      ],
      4: [
        { id: 9, name: 'Driver Licence Renewal Form', mandatory: true },
        { id: 10, name: 'Expired Licence', mandatory: true },
        { id: 11, name: 'Photo ID', mandatory: true }
      ],
      5: [
        { id: 12, name: 'Voter Registration Form', mandatory: true },
        { id: 13, name: 'Proof of Address', mandatory: true }
      ],
      6: [
        { id: 14, name: 'Subsidy Application Form', mandatory: true },
        { id: 15, name: 'Business Plan', mandatory: false },
        { id: 16, name: 'Financial Statements', mandatory: false }
      ],
      7: [
        { id: 17, name: 'Aadhaar', mandatory: true },
        { id: 18, name: 'School Record', mandatory: true },
        { id: 19, name: 'Previous Caste Certificate (if available)', mandatory: false }
      ],
      8: [
        { id: 20, name: 'Aadhaar', mandatory: true },
        { id: 21, name: 'Photograph', mandatory: true },
        { id: 22, name: 'Signature', mandatory: true }
      ],
      9: [
        { id: 23, name: 'Aadhaar', mandatory: true },
        { id: 24, name: 'Address Proof', mandatory: true },
        { id: 25, name: 'Learner License (if applying for permanent)', mandatory: false }
      ],
      10: [
        { id: 26, name: 'Shop Permit Application', mandatory: true },
        { id: 27, name: 'Proof of Address', mandatory: true },
        { id: 28, name: 'Owner Identity Proof', mandatory: true }
      ],
      11: [
        { id: 29, name: 'Income Certificate Application', mandatory: true },
        { id: 30, name: 'Proof of Income', mandatory: true },
        { id: 31, name: 'Identity Proof', mandatory: true }
      ]
    }
    if (docs[serviceId]) return docs[serviceId]
    if (serviceName) {
      const normalized = serviceName.toLowerCase()
      if (normalized.includes('shop')) {
        return docs[10]
      }
      if (normalized.includes('income')) {
        return docs[11]
      }
      if (normalized.includes('driving') || normalized.includes('licence') || normalized.includes('license')) {
        return docs[9]
      }
      if (normalized.includes('birth')) {
        return docs[1]
      }
      if (normalized.includes('business')) {
        return docs[2]
      }
    }
    return []
  }

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
        <Link to="/applied-services" className="btn btn-outline-primary">View applied services</Link>
      </div>

      <div className="row row-cols-1 g-3">
        {services.map(s => (
          <div className="col" key={s.id}>
            <div className={"card service-card h-100"}>
              <div className="card-body d-flex gap-3">
                <div className="service-thumb">
                  {s.image ? <img src={s.image} alt={s.name || s.serviceName} /> : <div className="thumb-fallback">{(s.name || s.serviceName || 'Service').split(' ').map(w => w[0]).slice(0,2).join('')}</div>}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="d-flex align-items-start justify-content-between">
                    <h5 className="card-title mb-1">{s.name || s.serviceName || 'Government Service'}</h5>
                  </div>
                  <p className="card-text text-truncate">{s.description || s.details || 'Description not available.'}</p>
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge-soft">{s.category || s.department || s.departmentName || 'Service'}</span>
                      <span className="badge-days">{(s.estimatedDays ?? s.days ?? 'N/A')} days</span>
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => openApply(s)}>Apply</button>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted department-text me-2">{s.department || s.departmentName || 'Department'}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {applyModalService && (
        <div className="modal-backdrop" onClick={closeApply}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Apply for {applyModalService.name}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeApply}>&times;</button>
            </div>
            <div className="modal-body">
              {applySuccess ? (
                <div>
                  <p className="mb-3">Your request has been submitted successfully.</p>
                  <p className="text-muted">A confirmation has been recorded and your documents were uploaded.</p>
                </div>
              ) : (
                <>
                  {applyErrors.length > 0 && (
                    <div className="alert alert-danger">
                      <ul className="mb-0">
                        {applyErrors.map((error, idx) => <li key={idx}>{error}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="mb-3">
                    <h6>Required documents</h6>
                    <ul className="mb-3">
                      {applyDocuments.map(doc => (
                        <li key={doc.id}>{doc.name} {doc.mandatory ? '(mandatory)' : '(optional)'}</li>
                      ))}
                    </ul>
                  </div>
                  <form onSubmit={submitApply}>
                    {getApplyFieldsForService(applyModalService.id, applyModalService.name).map(field => (
                      <div className="mb-3" key={field.name}>
                        <label className="form-label">{field.label}</label>
                        {field.type === 'select' ? (
                          <select className="form-select" value={applyForm[field.name] || ''} onChange={e => updateApplyField(field.name, e.target.value)} required={field.required}>
                            <option value="">Select {field.label}</option>
                            {field.options.map(option => (<option key={option} value={option}>{option}</option>))}
                          </select>
                        ) : (
                          <input
                            className="form-control"
                            type={field.type}
                            value={applyForm[field.name] || ''}
                            onChange={e => updateApplyField(field.name, e.target.value)}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                    <div className="mb-3">
                      <h6>Document uploads</h6>
                      {applyDocuments.map(doc => (
                        <div className="mb-3" key={doc.id}>
                          <label className="form-label">{doc.name}{doc.mandatory ? ' *' : ''}</label>
                          <input type="file" className="form-control" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => updateApplyDocument(doc.id, e.target.files[0] || null)} />
                          <small className="text-muted">Allowed formats: PDF, Word (.doc, .docx)</small>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-secondary" onClick={closeApply}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Submit request</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
