import React from 'react'

function CheckIcon({ filled }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="#0d6efd" />
      <path d="M4.5 8.2l1.8 1.8L11.5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="#adb5bd" strokeWidth="1.2" fill="#fff" />
    </svg>
  )
}

export default function WorkflowTimeline({ steps = [], completed = [], onToggle }) {
  return (
    <div className="workflow-timeline">
      {steps.map((s, idx) => {
        const done = completed.includes(s.stepOrder)
        return (
          <div key={s.id} className="timeline-item d-flex">
            <div className="timeline-marker me-3 d-flex flex-column align-items-center">
              <div className="marker">{<CheckIcon filled={done} />}</div>
              {idx < steps.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">{s.stepName}</h6>
                  <div className="small text-muted">{s.department} · {s.expectedDays} days</div>
                </div>
                <div>
                  <input type="checkbox" className="form-check-input" checked={done} onChange={() => onToggle(s)} />
                </div>
              </div>
              {s.description && <p className="mt-2 mb-0 text-muted">{s.description}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
