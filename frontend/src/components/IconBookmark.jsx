import React from 'react'

export default function IconBookmark({ filled }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d6efd" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2h12v20l-6-4-6 4V2z" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2h12v20l-6-4-6 4V2z" />
    </svg>
  )
}
