import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEdit, FaTrash, FaArrowLeft, FaClock, FaPrint, FaSearch } from 'react-icons/fa'
import { getAllQuotations, deleteQuotation } from '../utils/dbOperations'

function QuotationList() {
  const navigate = useNavigate()
  const [quotations, setQuotations] = useState([])
  const [filteredQuotations, setFilteredQuotations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [staffMode, setStaffMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load quotations first for faster page load
    loadQuotations()
    
    // Ask for password after a short delay to not block rendering
    setTimeout(() => {
      const pass = prompt('Enter staff password (leave blank for client view):')
      if (pass === 'admin123') {
        setStaffMode(true)
      }
    }, 100)
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
      alert('Only staff can delete quotations')
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
    const printWindow = window.open('', '_blank')
    const formatNum = (v) => `₹ ${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
    
    const subtotal = (quotation.rows || []).reduce((sum, r) => sum + (r.qty || 0) * (r.rateClient || 0), 0)
    const discount = subtotal * ((quotation.discount || 0) / 100)
    const afterDiscount = subtotal - discount
    const handling = quotation.handling || 0
    const taxable = afterDiscount + handling
    const tax = taxable * ((quotation.tax || 0) / 100)
    const grandTotal = taxable + tax

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${quotation.docNo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { text-align: center; color: #2563eb; }
          .header { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #2563eb; color: white; }
          .totals { margin-top: 20px; text-align: right; }
          .totals div { margin: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; color: #2563eb; }
          .terms { margin-top: 30px; }
          .terms h3 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>QUOTATION</h1>
        <div class="header">
          <div><strong>Quotation No:</strong> ${quotation.docNo || '-'}</div>
          <div><strong>Date:</strong> ${quotation.date || '-'}</div>
          <div><strong>Client:</strong> ${quotation.clientName || '-'}</div>
          <div><strong>Location:</strong> ${quotation.location || '-'}</div>
          <div><strong>Project:</strong> ${quotation.projectTitle || '-'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Section</th>
              <th>Component</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(quotation.rows || []).map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.section || ''}</td>
                <td>${r.name || ''}</td>
                <td>${r.description || ''}</td>
                <td>${r.unit || ''}</td>
                <td>${r.qty || 0}</td>
                <td>${r.rateClient || 0}</td>
                <td>${formatNum((r.qty || 0) * (r.rateClient || 0))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div><strong>Subtotal:</strong> ${formatNum(subtotal)}</div>
          ${quotation.discount > 0 ? `<div><strong>Discount (${quotation.discount}%):</strong> -${formatNum(discount)}</div>` : ''}
          ${handling > 0 ? `<div><strong>Handling Charges:</strong> ${formatNum(handling)}</div>` : ''}
          <div><strong>Taxable Amount:</strong> ${formatNum(taxable)}</div>
          <div><strong>GST (${quotation.tax || 0}%):</strong> ${formatNum(tax)}</div>
          <div class="grand-total"><strong>Grand Total:</strong> ${formatNum(grandTotal)}</div>
        </div>

        ${quotation.terms ? `
          <div class="terms">
            <h3>Terms & Conditions</h3>
            <p style="white-space: pre-wrap;">${quotation.terms}</p>
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
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
            {staffMode ? 'Staff Mode' : 'Client Mode'}
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
