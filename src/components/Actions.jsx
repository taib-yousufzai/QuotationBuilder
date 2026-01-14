import { FaFilePdf, FaPrint, FaSave, FaTrash, FaList, FaSyncAlt, FaDownload } from 'react-icons/fa'

function Actions({ handleExportPDF, handlePrint, clearAll, autoSave, setAutoSave, staffMode, navigate, saveToFirebase, loadByNumber }) {
  return (
    <div>
      <div className="actions">
        <button className="btn-primary" onClick={handleExportPDF}>
          <FaFilePdf /> Download PDF
        </button>
        <button className="btn-secondary" onClick={handlePrint}>
          <FaPrint /> Print
        </button>
        <button className="btn-secondary" onClick={() => saveToFirebase(true)}>
          <FaSave /> Save to Database
        </button>
        {staffMode && (
          <>
            <button className="btn-secondary" onClick={loadByNumber}>
              <FaDownload /> Load Quotation
            </button>
            <button className="btn-secondary" onClick={() => navigate('/list')}>
              <FaList /> View All Quotations
            </button>
          </>
        )}
        <button className="btn-danger" onClick={clearAll}>
          <FaTrash /> Clear / New
        </button>
      </div>

      <div className="auto-save">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
          />
          <span><FaSyncAlt /> Auto Save</span>
        </label>
      </div>
    </div>
  )
}

export default Actions
