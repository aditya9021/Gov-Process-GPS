import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import WorkflowTimeline from '../components/WorkflowTimeline'
import IconBookmark from '../components/IconBookmark'

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [workflow, setWorkflow] = useState([])
  const [documents, setDocuments] = useState([])
  const [rejections, setRejections] = useState([])
  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => {
    axios.get(`/api/services/${id}`).then(r => setService(r.data)).catch(e => console.error(e))
    axios.get(`/api/workflow/${id}`).then(r => setWorkflow(r.data)).catch(e => console.error(e))
    axios.get(`/api/documents/${id}`).then(r => setDocuments(r.data)).catch(e => console.error(e))
    axios.get(`/api/rejections/${id}`).then(r => setRejections(r.data)).catch(e => console.error(e))
    // fetch user progress for demo userId=1
    axios.get(`/api/progress/1`).then(r => {
      const userProgress = r.data.find(p => p.serviceId === Number(id))
      if (userProgress) setCompletedSteps(userProgress.completedStep ? [userProgress.completedStep] : [])
    }).catch(() => {})
  }, [id])

  const toggleStep = toggleStepFactory(id, workflow, completedSteps, setCompletedSteps)

  if (!service) return <div>Loading...</div>

  return (
    <div>
      <h2>{service.name}</h2>
      <p>{service.description}</p>
      <h4>Workflow</h4>
      <div className="mb-3">
        <div className="progress" style={{height: '20px'}}>
          <div className="progress-bar" role="progressbar" style={{width: `${(completedSteps.length / Math.max(workflow.length,1))*100}%`}}>
            {Math.round((completedSteps.length / Math.max(workflow.length,1))*100)}%
          </div>
        </div>
      </div>

      <WorkflowTimeline steps={workflow} completed={completedSteps} onToggle={toggleStep} />
      <div className="mb-3 d-flex gap-2">
        <button className="btn btn-primary d-flex align-items-center" onClick={() => saveBookmark(id)}>
          <IconBookmark filled={false} />
          <span className="ms-2">Save / Bookmark</span>
        </button>
        <a className="btn btn-outline-secondary" href="#faq">FAQ</a>
      </div>
      <h4>Documents</h4>
      <ul>
        {documents.map(d => (<li key={d.id}>{d.documentName} {d.mandatory ? '(mandatory)' : ''}</li>))}
      </ul>
      <h4>Common Rejection Reasons</h4>
      <ul>
        {rejections.map(r => (<li key={r.id}>{r.reason}</li>))}
      </ul>
    </div>
  )
}

function toggleStepFactory(id, workflow, completedSteps, setCompletedSteps) {
  return function toggleStep(step) {
    const stepOrder = step.stepOrder
    let updated = []
    if (completedSteps.includes(stepOrder)) {
      updated = completedSteps.filter(s => s !== stepOrder)
    } else {
      updated = [...completedSteps, stepOrder]
    }
    setCompletedSteps(updated)
    // save simple progress record for demo user 1
    const payload = { userId: 1, serviceId: Number(id), completedStep: Math.max(...updated, 0), status: 'IN_PROGRESS' }
    axios.post('/api/progress', payload).catch(e => console.error(e))
  }
}

function saveBookmark(id) {
  axios.post('/api/bookmarks', { userId: 1, serviceId: Number(id) }).then(() => alert('Bookmarked (demo)')).catch(e => console.error(e))
}

