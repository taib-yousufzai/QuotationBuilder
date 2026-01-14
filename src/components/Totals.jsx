import { FaCalculator } from 'react-icons/fa'

function Totals({ rows, formData, setFormData, currency, staffMode }) {
  const calculateTotals = () => {
    let clientSubtotal = 0
    let actualSubtotal = 0
    
    rows.forEach(r => {
      clientSubtotal += (r.qty || 0) * (r.rateClient || 0)
      actualSubtotal += (r.qty || 0) * (r.rateActual || 0)
    })

    const discount = parseFloat(formData.discount) || 0
    const handling = parseFloat(formData.handling) || 0
    const tax = parseFloat(formData.tax) || 0

    const clientAfterDiscount = clientSubtotal - (clientSubtotal * discount / 100)
    const clientPretax = clientAfterDiscount + (clientAfterDiscount * handling / 100)
    const clientTax = clientPretax * (tax / 100)
    const clientGrand = clientPretax + clientTax

    const actualAfterDiscount = actualSubtotal - (actualSubtotal * discount / 100)
    const actualPretax = actualAfterDiscount + (actualAfterDiscount * handling / 100)
    const actualTax = actualPretax * (tax / 100)
    const actualGrand = actualPretax + actualTax

    const profit = clientGrand - actualGrand

    return {
      clientSubtotal,
      actualSubtotal,
      clientPretax,
      actualPretax,
      clientTax,
      actualTax,
      clientGrand,
      actualGrand,
      profit
    }
  }

  const totals = calculateTotals()
  const formatNum = (v) => `${currency} ${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`

  return (
    <div className="totals-section">
      <h3><FaCalculator /> Totals</h3>
      <div className="totals">
        <div className="total-item">
          <span>Client Subtotal:</span>
          <span className="total-value">{formatNum(totals.clientSubtotal)}</span>
        </div>
        {staffMode && (
          <div className="total-item actual-col">
            <span>Actual Subtotal:</span>
            <span className="total-value">{formatNum(totals.actualSubtotal)}</span>
          </div>
        )}
        <div className="total-item">
          <span>Discount %</span>
          <input 
            type="number" 
            step="0.01" 
            className="total-input"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
          />
        </div>
        <div className="total-item">
          <span>Handling %</span>
          <input 
            type="number" 
            step="0.01" 
            className="total-input"
            value={formData.handling}
            onChange={(e) => setFormData(prev => ({ ...prev, handling: e.target.value }))}
          />
        </div>
        <div className="total-item">
          <span>Tax %</span>
          <input 
            type="number" 
            step="0.01" 
            className="total-input"
            value={formData.tax}
            onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))}
          />
        </div>
        <div className="total-item">
          <span>Pre-Tax (Client):</span>
          <span className="total-value">{formatNum(totals.clientPretax)}</span>
        </div>
        {staffMode && (
          <div className="total-item actual-col">
            <span>Pre-Tax (Actual):</span>
            <span className="total-value">{formatNum(totals.actualPretax)}</span>
          </div>
        )}
        <div className="total-item">
          <span>GST (Client):</span>
          <span className="total-value">{formatNum(totals.clientTax)}</span>
        </div>
        {staffMode && (
          <div className="total-item actual-col">
            <span>GST (Actual):</span>
            <span className="total-value">{formatNum(totals.actualTax)}</span>
          </div>
        )}
        <div className="total-item total-grand">
          <span><strong>Client Total:</strong></span>
          <strong className="total-value">{formatNum(totals.clientGrand)}</strong>
        </div>
        {staffMode && (
          <>
            <div className="total-item total-grand actual-col">
              <span><strong>Actual Total:</strong></span>
              <strong className="total-value">{formatNum(totals.actualGrand)}</strong>
            </div>
            <div className="total-item total-profit actual-col">
              <span>Profit:</span>
              <strong className="total-value">{formatNum(totals.profit)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Totals
