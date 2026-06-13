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

  function openApply(service){
    setApplyModalService(service)
    setApplyDocuments(getDocumentsForService(service.id).map(doc => ({ ...doc, attached: false, file: null })))
    setApplyForm(initApplyForm(service.id))
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
    setApplyDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, attached: !!file, file } : doc))
  }

  function persistAppliedService(payload) {
    const stored = JSON.parse(localStorage.getItem('appliedServices') || '[]')
    localStorage.setItem('appliedServices', JSON.stringify([payload, ...stored]))
  }

  function submitApply(e){
    e.preventDefault()
    const errors = []
    const fields = getApplyFieldsForService(applyModalService.id)
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
      return
    }
    const payload = {
      serviceId: applyModalService?.id,
      serviceName: applyModalService?.name,
      department: applyModalService?.department,
      category: applyModalService?.category,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      data: applyForm,
      documents: applyDocuments.map(d => ({ 
        id: d.id,
        name: d.name, 
        fileName: d.file ? d.file.name : null,
        uploaded: d.attached,
        uploadedAt: d.attached ? new Date().toISOString() : null,
        mandatory: d.mandatory
      }))
    }
    persistAppliedService(payload)
    console.log('Mock apply payload:', payload)
    setApplySuccess(true)
  }

  function getApplyFieldsForService(serviceId){
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
      ]
    }
    return fields[serviceId] || [{ name: 'applicantName', label: 'Applicant Name', type: 'text', required: true }]
  }

  function initApplyForm(serviceId){
    return getApplyFieldsForService(serviceId).reduce((form, field) => ({ ...form, [field.name]: '' }), {})
  }

  function getDocumentsForService(serviceId){
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
      ]
    }
    return docs[serviceId] || []
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
                  {s.image ? <img src={s.image} alt={s.name} /> : <div className="thumb-fallback">{s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="d-flex align-items-start justify-content-between">
                    <h5 className="card-title mb-1">{s.name}</h5>
                  </div>
                  <p className="card-text text-truncate">{s.description}</p>
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge-soft">{s.category || s.department}</span>
                      <span className="badge-days">{s.estimatedDays} days</span>
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => openApply(s)}>Apply</button>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted department-text me-2">{s.department}</small>
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
                  <pre className="bg-light p-3 rounded">{JSON.stringify({ serviceId: applyModalService.id, serviceName: applyModalService.name, documents: applyDocuments.map(d => ({ name: d.name, attached: d.attached, fileName: d.file ? d.file.name : null })), ...applyForm }, null, 2)}</pre>
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
                    {getApplyFieldsForService(applyModalService.id).map(field => (
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
                          <input type="file" className="form-control" onChange={e => updateApplyDocument(doc.id, e.target.files[0] || null)} />
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
