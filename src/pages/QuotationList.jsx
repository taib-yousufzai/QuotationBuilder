import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEdit, FaTrash, FaArrowLeft, FaClock, FaPrint, FaSearch, FaCopy } from 'react-icons/fa'
import { getAllQuotations, deleteQuotation } from '../utils/dbOperations'
import { copyQuotationToBuilder, createCopyUrlParams } from '../utils/copyQuotationService'

function QuotationList() {
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState([])
  const [filteredQuotations, setFilteredQuotations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [staffMode, setStaffMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copyingId, setCopyingId] = useState(null)

  useEffect(() => {
    // Load quotations first for faster page load
    loadQuotations()

    // Check if admin mode is already active
    const isAdmin = sessionStorage.getItem('adminMode') === 'true'
    if (isAdmin) {
      setStaffMode(true)
    } else {
      // Ask for password after a short delay to not block rendering
      setTimeout(() => {
        const pass = prompt('Enter admin password (leave blank for client view):')
        if (pass === 'MorphiumAdmin@2024') {
          setStaffMode(true)
          sessionStorage.setItem('adminMode', 'true')
        }
      }, 100)
    }
  }, [])

  const loadQuotations = async () => {
    const result = await getAllQuotations()
    if (result.success) {
      setQuotations(result.data)
      setFilteredQuotations(result.data)
    } else {
      alert(result.message || 'Error loading quotations')
    }
    setLoading(false)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setFilteredQuotations(quotations)
      return
    }

    const searchLower = value.toLowerCase()
    const filtered = quotations.filter(q =>
      q.docNo?.toLowerCase().includes(searchLower) ||
      q.clientName?.toLowerCase().includes(searchLower) ||
      q.projectTitle?.toLowerCase().includes(searchLower) ||
      q.location?.toLowerCase().includes(searchLower)
    )
    setFilteredQuotations(filtered)
  }

  const handleDelete = async (id) => {
    if (!staffMode) {
      alert('Only admin can delete quotations')
      return
    }
    if (!confirm(`Delete quotation ${id}? This cannot be undone.`)) return

    const result = await deleteQuotation(id)
    if (result.success) {
      const updatedQuotations = quotations.filter(q => q.id !== id)
      setQuotations(updatedQuotations)
      setFilteredQuotations(updatedQuotations.filter(q =>
        !searchTerm ||
        q.docNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.location?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
      alert(result.message)
    } else {
      alert(result.message || 'Error deleting quotation')
    }
  }

  const calculateDaysAgo = (dateString) => {
    if (!dateString) return 'N/A'
    const quotationDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - quotationDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const handlePrint = (quotation) => {
    // Open the view page in a new window and trigger print
    const viewUrl = `/view/${quotation.id}`
    const printWindow = window.open(viewUrl, '_blank')

    // Wait for the page to load, then trigger print
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 1000)
      }
    }
  }

  const handleCopyToBuilder = async (quotation) => {
    try {
      setCopyingId(quotation.id)

      // Copy the quotation data
      const copiedData = copyQuotationToBuilder(quotation)

      // Create URL parameters for the copy operation
      const urlParams = createCopyUrlParams(quotation.id)

      // Store the copied data in sessionStorage for the builder to pick up
      sessionStorage.setItem('copiedQuotationData', JSON.stringify(copiedData))

      // Show success message
      alert(`Quotation ${quotation.docNo} copied successfully! Redirecting to builder...`)

      // Navigate to builder with copy parameters
      navigate(`/?${urlParams}`)

    } catch (error) {
      console.error('Error copying quotation:', error)
      alert(`Error copying quotation: ${error.message}`)
    } finally {
      setCopyingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--bd)', borderTop: '4px solid var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: 'var(--blue)', fontSize: '16px' }}>Loading quotations...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--blue)' }}>All Saved Quotations</h1>
        <div>
          <span style={{ color: 'var(--blue)', fontWeight: 600, marginRight: '20px' }}>
            {staffMode ? 'Admin Mode' : 'Client Mode'}
          </span>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Builder
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue)', fontSize: '16px' }} />
          <input
            type="text"
            placeholder="Search by quotation no, client, project, or location..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '2px solid var(--bd)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--bd)'}
          />
        </div>
        {searchTerm && (
          <div style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: 600 }}>
            Found {filteredQuotations.length} of {quotations.length} quotations
          </div>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: 'var(--blue)', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Quotation No.</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Project</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Age</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuotations.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                {searchTerm ? `No quotations found matching "${searchTerm}"` : 'No quotations found.'}
              </td>
            </tr>
          ) : (
            filteredQuotations.map((q, i) => (
              <tr key={q.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                <td style={{ padding: '12px' }}>{i + 1}</td>
                <td style={{ padding: '12px' }}>{q.docNo}</td>
                <td style={{ padding: '12px' }}>{q.clientName}</td>
                <td style={{ padding: '12px' }}>{q.projectTitle}</td>
                <td style={{ padding: '12px' }}>{q.date}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--blue)' }}>
                    <FaClock /> {calculateDaysAgo(q.date)}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    className="btn-secondary"
                    style={{ marginRight: '8px', padding: '6px 12px' }}
                    onClick={() => navigate(`/view/${q.id}`)}
                  >
                    <FaEye /> View
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ marginRight: '8px', padding: '6px 12px' }}
                    onClick={() => handlePrint(q)}
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    className="btn-secondary"
                    style={{
                      marginRight: '8px',
                      padding: '6px 12px',
                      opacity: copyingId === q.id ? 0.6 : 1,
                      cursor: copyingId === q.id ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => handleCopyToBuilder(q)}
                    disabled={copyingId === q.id}
                    title="Copy this quotation to the builder for editing"
                  >
                    {copyingId === q.id ? (
                      <>
                        <div style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          border: '2px solid var(--blue)',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '4px'
                        }}></div>
                        Copying...
                      </>
                    ) : (
                      <>
                        <FaCopy data-testid="copy-icon" /> Copy to Builder
                      </>
                    )}
                  </button>
                  {staffMode && (
                    <>
                      <button
                        className="btn-secondary"
                        style={{ marginRight: '8px', padding: '6px 12px' }}
                        onClick={() => navigate(`/?load=${q.docNo}`)}
                      >
                        <FaEdit /> Load
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleDelete(q.id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default QuotationList
