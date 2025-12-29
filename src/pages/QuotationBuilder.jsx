import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { presets, defaultDescription } from '../data/presets'
import Header from '../components/Header'
import ClientDetails from '../components/ClientDetails'
import ItemForm from '../components/ItemForm'
import QuotePreview from '../components/QuotePreview'
import Totals from '../components/Totals'
import Actions from '../components/Actions'
import { exportToPDF } from '../utils/pdfExport'
import { saveQuotation, loadQuotation } from '../utils/dbOperations'

function QuotationBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [staffMode, setStaffMode] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('rk_qb_theme') || 'light')
  const [currency, setCurrency] = useState(localStorage.getItem('rk_qb_currency') || '₹')
  const [pageSize, setPageSize] = useState(localStorage.getItem('rk_qb_pageSize') || 'a4')
  const [orientation, setOrientation] = useState(localStorage.getItem('rk_qb_orientation') || 'p')
  const [autoSave, setAutoSave] = useState(true)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [visibleSections, setVisibleSections] = useState({
    materialDescription: false,  // Hide by default - can be enabled if needed
    paymentSchedule: true,
    warranty: true,
    bankDetails: true
  })
  
  const [formData, setFormData] = useState({
    docNo: '',
    clientName: '',
    location: '',
    projectTitle: '',
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    handling: 10,
    tax: 18,
    terms: '1. 30% advance upon order confirmation.\n2. Balance as per progress milestones.\n3. Delivery and installation as per schedule.\n4. All materials are of approved quality.'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    autoSetQuoteNumber()
    loadFromStorage()
    const qno = searchParams.get('load') || searchParams.get('qno')
    if (qno) loadQuotationFromFirebase(qno)
  }, [])

  useEffect(() => {
    if (autoSave) saveDraft()
  }, [rows, formData, autoSave])

  const autoSetQuoteNumber = () => {
    let last = localStorage.getItem('qb_last_no') || '0'
    last = parseInt(last) + 1
    localStorage.setItem('qb_last_no', last)
    const num = String(last).padStart(4, '0')
    if (!formData.docNo) setFormData(prev => ({ ...prev, docNo: `LI-${num}` }))
  }

  const saveDraft = () => {
    const draft = { ...formData, rows }
    localStorage.setItem('rk_qb_data', JSON.stringify(draft))
  }

  const loadFromStorage = () => {
    const raw = localStorage.getItem('rk_qb_data')
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      setRows(data.rows || [])
      setFormData(prev => ({ ...prev, ...data }))
    } catch (e) {
      console.error('Failed to restore draft', e)
    }
  }

  const loadQuotationFromFirebase = async (qno) => {
    const result = await loadQuotation(qno)
    if (result.success) {
      const data = result.data
      setRows(data.rows || [])
      setFormData(prev => ({ ...prev, ...data }))
      alert(`Quotation ${qno} loaded successfully!`)
    } else {
      alert(result.message || 'Quotation not found.')
    }
  }

  const saveToFirebase = async () => {
    if (!formData.docNo) {
      alert('Please enter a quotation number first.')
      return
    }
    const data = { ...formData, rows }
    const result = await saveQuotation(data)
    alert(result.message)
  }

  const addItem = (item) => {
    setRows(prev => [...prev, item])
  }

  const deleteRow = (index) => {
    if (!confirm('Delete this item?')) return
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  const duplicateRow = (index) => {
    setRows(prev => [...prev.slice(0, index + 1), { ...prev[index] }, ...prev.slice(index + 1)])
  }

  const clearAll = () => {
    if (!confirm('This will clear the current quotation and create a NEW quotation number. Continue?')) return
    setRows([])
    autoSetQuoteNumber()
    setFormData({
      docNo: '',
      clientName: '',
      location: '',
      projectTitle: '',
      date: new Date().toISOString().split('T')[0],
      discount: 0,
      handling: 10,
      tax: 18,
      terms: '1. 30% advance upon order confirmation.\n2. Balance as per progress milestones.'
    })
    localStorage.removeItem('rk_qb_data')
  }

  const handleExportPDF = async (options = {}) => {
    await exportToPDF(formData, rows, staffMode, currency, pageSize, orientation, options)
    if (formData.docNo) {
      await saveQuotation({ ...formData, rows })
    }
  }

  const toggleStaffMode = () => {
    if (!staffMode) {
      const pass = prompt('Enter staff password:')
      if (pass === 'admin123') {
        setStaffMode(true)
        document.body.classList.add('staff-mode')
      } else if (pass !== null) {
        alert('Incorrect password')
      }
    } else {
      setStaffMode(false)
      document.body.classList.remove('staff-mode')
    }
  }

  const loadByNumber = async () => {
    const qno = prompt('Enter quotation number to load:')
    if (!qno) return
    await loadQuotationFromFirebase(qno)
  }

  return (
    <div>
      <Header 
        formData={formData}
        setFormData={setFormData}
        theme={theme}
        setTheme={setTheme}
        currency={currency}
        setCurrency={setCurrency}
        pageSize={pageSize}
        setPageSize={setPageSize}
        orientation={orientation}
        setOrientation={setOrientation}
        toggleStaffMode={toggleStaffMode}
        staffMode={staffMode}
      />
      <ClientDetails formData={formData} setFormData={setFormData} />
      <div className="layout">
        <aside className="controls">
          <ItemForm 
            addItem={addItem}
            staffMode={staffMode}
          />
          <hr className="divider" />
          <Totals 
            rows={rows}
            formData={formData}
            setFormData={setFormData}
            currency={currency}
            staffMode={staffMode}
          />
          <hr className="divider" />
          <div className="terms-section">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blue)', marginBottom: '12px' }}>
              Terms & Conditions
            </h3>
            <textarea 
              className="modern-textarea" 
              rows="5"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Enter terms and conditions..."
            />
          </div>
          <Actions 
            handleExportPDF={handleExportPDF}
            clearAll={clearAll}
            autoSave={autoSave}
            setAutoSave={setAutoSave}
            staffMode={staffMode}
            navigate={navigate}
            saveToFirebase={saveToFirebase}
            loadByNumber={loadByNumber}
          />
        </aside>
        <QuotePreview 
          formData={formData}
          rows={rows}
          deleteRow={deleteRow}
          duplicateRow={duplicateRow}
          currency={currency}
          staffMode={staffMode}
          visibleSections={visibleSections}
          setVisibleSections={setVisibleSections}
        />
      </div>
    </div>
  )
}

export default QuotationBuilder
