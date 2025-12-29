import { FaFileInvoice, FaTrash, FaCopy, FaFileContract, FaPercentage, FaCalculator, FaMoneyBillWave, FaFolder } from 'react-icons/fa'

// Number to words converter
function numberToWords(num) {
  if (num === 0) return 'Zero'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  function convertLessThanThousand(n) {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
  }
  
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const remainder = Math.floor(num % 1000)
  
  let result = ''
  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore '
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh '
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand '
  if (remainder > 0) result += convertLessThanThousand(remainder)
  
  return result.trim()
}

function QuotePreview({ formData, rows, deleteRow, duplicateRow, currency, staffMode, visibleSections, setVisibleSections }) {
  const formatNum = (v) => `${currency} ${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`

  // Calculate all totals
  const clientSubtotal = rows.reduce((sum, r) => sum + (r.qty || 0) * (r.rateClient || 0), 0)
  const actualSubtotal = rows.reduce((sum, r) => sum + (r.qty || 0) * (r.rateActual || 0), 0)
  
  const discount = parseFloat(formData.discount) || 0
  const handling = parseFloat(formData.handling) || 0
  const tax = parseFloat(formData.tax) || 0

  const clientAfterDiscount = clientSubtotal - (clientSubtotal * discount / 100)
  const discountAmount = clientSubtotal * discount / 100
  const clientPretax = clientAfterDiscount + (clientAfterDiscount * handling / 100)
  const handlingAmount = clientAfterDiscount * handling / 100
  const clientTax = clientPretax * (tax / 100)
  const clientGrand = clientPretax + clientTax

  const actualAfterDiscount = actualSubtotal - (actualSubtotal * discount / 100)
  const actualPretax = actualAfterDiscount + (actualAfterDiscount * handling / 100)
  const actualTax = actualPretax * (tax / 100)
  const actualGrand = actualPretax + actualTax
  const profit = clientGrand - actualGrand

  return (
    <section className="quote-wrapper">
      <div className="quote-header">
        <h2><FaFileInvoice /> Quotation Preview</h2>
        <div className="quote-info">
          <span>Quote #: {formData.docNo || '-'}</span>
          <span>Date: {formData.date || new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="section-controls no-print">
        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--blue)' }}>Show/Hide Sections:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={visibleSections.materialDescription}
              onChange={(e) => setVisibleSections(prev => ({ ...prev, materialDescription: e.target.checked }))}
            />
            <span>Material Description</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={visibleSections.paymentSchedule}
              onChange={(e) => setVisibleSections(prev => ({ ...prev, paymentSchedule: e.target.checked }))}
            />
            <span>Payment Schedule</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={visibleSections.warranty}
              onChange={(e) => setVisibleSections(prev => ({ ...prev, warranty: e.target.checked }))}
            />
            <span>Warranty & Terms</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={visibleSections.bankDetails}
              onChange={(e) => setVisibleSections(prev => ({ ...prev, bankDetails: e.target.checked }))}
            />
            <span>Bank Details</span>
          </label>
        </div>
      </div>
      <div className="quote" id="previewArea">
        <div className="quote-header-preview">
          <div className="company-info">
            <div>
              <h2 contentEditable suppressContentEditableWarning>Lifeasy Interior</h2>
              <p contentEditable suppressContentEditableWarning>Design & Build Solutions</p>
            </div>
          </div>
          <div className="quote-meta-preview">
            <div><strong>Quote #:</strong> <span contentEditable suppressContentEditableWarning>{formData.docNo || '-'}</span></div>
            <div><strong>Date:</strong> <span contentEditable suppressContentEditableWarning>{formData.date || '-'}</span></div>
          </div>
        </div>
        <div className="client-info-preview">
          <div><strong>Client:</strong> <span contentEditable suppressContentEditableWarning>{formData.clientName || '-'}</span></div>
          <div><strong>Location:</strong> <span contentEditable suppressContentEditableWarning>{formData.location || '-'}</span></div>
          <div><strong>Project:</strong> <span contentEditable suppressContentEditableWarning>{formData.projectTitle || '-'}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Component</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
              {staffMode && <th className="actual-col">Actual Price</th>}
              {staffMode && <th className="actual-col">Actual Amount</th>}
              <th>Remarks</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={staffMode ? 11 : 9} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No items added yet. Add items using the form on the left.
                </td>
              </tr>
            ) : (() => {
              let currentSection = ''
              let sectionIndex = 0
              return rows.map((r, i) => {
                const originalIndex = rows.indexOf(r)
                const showSectionHeader = r.section !== currentSection
                if (showSectionHeader) {
                  currentSection = r.section
                  sectionIndex++
                }
                
                return (
                  <>
                    {showSectionHeader && (
                      <tr key={`section-${sectionIndex}`} className="section-header-row">
                        <td colSpan={staffMode ? 11 : 9} className="section-header-cell">
                          <FaFolder style={{ marginRight: '8px' }} />
                          <strong>{r.section || 'General'}</strong>
                        </td>
                      </tr>
                    )}
                    <tr key={i}>
                      <td>{originalIndex + 1}</td>
                      <td><strong contentEditable suppressContentEditableWarning>{r.name}</strong></td>
                      <td className="description-cell" contentEditable suppressContentEditableWarning>{r.description || 'Standard material & finish included.'}</td>
                      <td className="center" contentEditable suppressContentEditableWarning>{r.unit}</td>
                      <td className="num" contentEditable suppressContentEditableWarning>{r.qty}</td>
                      <td className="num" contentEditable suppressContentEditableWarning>{formatNum(r.rateClient)}</td>
                      <td className="num amount-highlight">{formatNum(r.qty * r.rateClient)}</td>
                      {staffMode && <td className="actual-col num" contentEditable suppressContentEditableWarning>{formatNum(r.rateActual)}</td>}
                      {staffMode && <td className="actual-col num amount-highlight">{formatNum(r.qty * r.rateActual)}</td>}
                      <td className="remark-cell" contentEditable suppressContentEditableWarning>{r.remark || '-'}</td>
                      <td className="no-print">
                        <button className="delete-btn" onClick={() => deleteRow(originalIndex)} title="Delete">
                          <FaTrash />
                        </button>
                        <button className="duplicate-btn" onClick={() => duplicateRow(originalIndex)} title="Duplicate">
                          <FaCopy />
                        </button>
                      </td>
                    </tr>
                  </>
                )
              })
            })()}
          </tbody>
          <tfoot>
            <tr className="subtotal-row">
              <td colSpan="6" className="right"><strong>Subtotal</strong></td>
              <td className="num"><strong>{formatNum(clientSubtotal)}</strong></td>
              {staffMode && <td className="actual-col"></td>}
              {staffMode && <td className="actual-col num"><strong>{formatNum(actualSubtotal)}</strong></td>}
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>

        {/* Enhanced Summary Section */}
        <div className="quotation-summary">
          <div className="summary-grid">
            <div className="summary-section">
              <h4><FaCalculator /> Calculation Breakdown</h4>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">{formatNum(clientSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-item discount-item">
                    <span className="summary-label">
                      <FaPercentage /> Discount ({discount}%):
                    </span>
                    <span className="summary-value negative">- {formatNum(discountAmount)}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">After Discount:</span>
                  <span className="summary-value">{formatNum(clientAfterDiscount)}</span>
                </div>
                {handling > 0 && (
                  <div className="summary-item">
                    <span className="summary-label">Handling Charges ({handling}%):</span>
                    <span className="summary-value">+ {formatNum(handlingAmount)}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">Taxable Amount:</span>
                  <span className="summary-value">{formatNum(clientPretax)}</span>
                </div>
                <div className="summary-item tax-item">
                  <span className="summary-label">GST ({tax}%):</span>
                  <span className="summary-value">+ {formatNum(clientTax)}</span>
                </div>
              </div>
            </div>

            <div className="summary-section grand-total-section">
              <h4><FaMoneyBillWave /> Final Amount</h4>
              <div className="grand-total-box">
                <div className="grand-total-label">Total Amount Payable</div>
                <div className="grand-total-value">{formatNum(clientGrand)}</div>
                <div className="grand-total-words">
                  {numberToWords(clientGrand)} Only
                </div>
              </div>
              
              {staffMode && (
                <div className="staff-summary">
                  <div className="staff-item">
                    <span>Actual Cost:</span>
                    <span>{formatNum(actualGrand)}</span>
                  </div>
                  <div className="staff-item profit-item">
                    <span>Estimated Profit:</span>
                    <span className="profit-value">{formatNum(profit)}</span>
                  </div>
                  <div className="staff-item">
                    <span>Profit Margin:</span>
                    <span>{((profit / clientGrand) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Material Description Specifications */}
        {visibleSections.materialDescription && (
        <div className="specifications-section">
          <h3 className="section-title">material discription</h3>
          <table className="specifications-table">
            <tbody>
              <tr>
                <td className="spec-label"><strong>Carcase</strong></td>
                <td className="spec-value" contentEditable suppressContentEditableWarning>Action Tesa/Century/Cross Bond</td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>16.75mm preiam hchmr board (Texture/white)</td>
                <td className="spec-measurement" contentEditable suppressContentEditableWarning>16.75mm</td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Shutters</strong></td>
                <td className="spec-value" contentEditable suppressContentEditableWarning>Action Tesa/Century/Cross Bond</td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>hdhmr with: 8 laminate inside and 1mm laminate outside</td>
                <td className="spec-measurement"></td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Fittings</strong></td>
                <td className="spec-value" contentEditable suppressContentEditableWarning>Hettich</td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>Soft Channels & Hinges</td>
                <td className="spec-measurement"></td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Laminate</strong></td>
                <td className="spec-value" contentEditable suppressContentEditableWarning>Century, Merino, Greenlam</td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>Outer Laminate Ugro INR 1300-1500/Sheet</td>
                <td className="spec-measurement" contentEditable suppressContentEditableWarning>1mm</td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Acrylic Laminate</strong></td>
                <td className="spec-value" contentEditable suppressContentEditableWarning>Prelamo Board Action Tesa</td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>Outer Laminate Ugro INR 3500-4000/Sheet</td>
                <td className="spec-measurement" contentEditable suppressContentEditableWarning>1.5mm</td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Inner Laminate</strong></td>
                <td className="spec-value"></td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>Inner Pre- Laminate rates upto 450rs/sheet</td>
                <td className="spec-measurement" contentEditable suppressContentEditableWarning>8mm</td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Handles</strong></td>
                <td className="spec-value"></td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>Big Size upto INR 300 / Pis, Small size handles upto 150/ Pis and Nobes rates upto INR100</td>
                <td className="spec-measurement"></td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Accessories</strong></td>
                <td className="spec-value"></td>
                <td className="spec-detail" contentEditable suppressContentEditableWarning>all Other Accessories at extra cost</td>
                <td className="spec-measurement"></td>
              </tr>
              <tr>
                <td className="spec-label"><strong>All Furniture SPECIFICATIONS</strong></td>
                <td colSpan="3" className="spec-detail" contentEditable suppressContentEditableWarning>All Furniture. With upto 2 Drawers, Glass work and lights provision of upto 24sqft.one shutters, one open shelves. All other accessories like stone at extra cost is not included</td>
              </tr>
              <tr>
                <td className="spec-label"></td>
                <td colSpan="3" className="spec-detail" contentEditable suppressContentEditableWarning>Wardrobe with openable shutters,</td>
              </tr>
              <tr>
                <td className="spec-label"><strong>Wardrobe</strong></td>
                <td colSpan="3" className="spec-detail" contentEditable suppressContentEditableWarning>2 handles, upto 2 drawers, 1 profile light provision, 1 SS hanging rail. 2 locks each section of upto 24sqft. Light and other accessories at extra cost</td>
              </tr>
            </tbody>
          </table>
        </div>
        )}

        {/* Payment Schedule */}
        {visibleSections.paymentSchedule && (
        <div className="payment-section">
          <h3 className="section-title">PAYMENT SCHEDULE</h3>
          <div className="payment-table">
            <div className="payment-row payment-header">
              <div className="payment-col">Installment</div>
              <div className="payment-col">Payment Terms</div>
            </div>
            <div className="payment-row">
              <div className="payment-col"><strong>1st Installment</strong></div>
              <div className="payment-col" contentEditable suppressContentEditableWarning>Booking Amount 10% to Begin Design</div>
            </div>
            <div className="payment-row">
              <div className="payment-col"><strong>2nd Installment</strong></div>
              <div className="payment-col" contentEditable suppressContentEditableWarning>Move To Production 40% to begin with production & work at site.</div>
            </div>
            <div className="payment-row">
              <div className="payment-col"><strong>3rd Installment</strong></div>
              <div className="payment-col" contentEditable suppressContentEditableWarning>50% work Completed 50% - Production Completed Ready to Dispatch at site.</div>
            </div>
          </div>
        </div>
        )}

        {/* Warranty and Terms */}
        {visibleSections.warranty && (
        <div className="warranty-section">
          <h3 className="section-title">WARRANTY AND DISCLAIMER OF WARRANTY-WOOD WORK</h3>
          <h4 className="subsection-title">TERMS & CONDITIONS</h4>
          
          <div className="terms-list">
            <div className="term-item">
              <strong>1. Booking Fee:</strong> A 10% booking fee is required to secure your project. This amount will be adjusted against future orders.
            </div>
            
            <div className="term-item">
              <strong>2. Refunds:</strong> You have a 72-hour free look window post-booking to cancel the project with a full refund. No refunds will be provided if the project is canceled after this period.
            </div>
            
            <div className="term-item">
              <strong>3. Transaction Fees:</strong> A 2% convenience fee applies to payments via Wallets, IMPS, Debit Card, or Credit Card. No fees apply to NEFT, RTGS, or Cheque payments.
            </div>
            
            <div className="term-item">
              <strong>4. Authorized Signatory Changes in Pricing:</strong> The final price depends on the agreed scope, site measurements, material finishes, and any customizations. Expect a possible 5-10% variation from this quote, with larger changes possible for significant modifications.
            </div>
            
            <div className="term-item">
              <strong>5. Effect of Scope Changes:</strong> Any changes to the project scope or value during execution will result in the withdrawal of free gifts or discounts offered at the time of sale.
            </div>
            
            <div className="term-item">
              <strong>6. Finalized Quote (BOUC Price mutually agreed upon):</strong> No quote adjustments will be made during execution, even if proposed changes are of similar value.
            </div>
            
            <div className="term-item">
              <strong>7. Site Access:</strong> The client must provide unrestricted site access, water, and electricity. Delays due to restricted access will terminate the agreed delivery timeline with immediate effect.
            </div>
            
            <div className="term-item">
              <strong>8. Warranty:</strong> A 10-year warranty applies to modular kitchens, wardrobes, storage, hardware, and accessories. This excludes damages due to accidents, abnormal use, extreme conditions, or harsh cleaning agents.
            </div>
          </div>
        </div>
        )}

        {/* Bank Details */}
        {visibleSections.bankDetails && (
        <div className="bank-section">
          <h3 className="section-title">BANK DETAILS FOR PAYMENT</h3>
          <div className="bank-details-grid">
            <div className="bank-item">
              <span className="bank-label">Bank Name:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>HDFC Bank</span>
            </div>
            <div className="bank-item">
              <span className="bank-label">Account Name:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>Lifeasy Interior</span>
            </div>
            <div className="bank-item">
              <span className="bank-label">Account Number:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>XXXX XXXX XXXX 1234</span>
            </div>
            <div className="bank-item">
              <span className="bank-label">IFSC Code:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>HDFC0001234</span>
            </div>
            <div className="bank-item">
              <span className="bank-label">Branch:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>Main Branch, City</span>
            </div>
            <div className="bank-item">
              <span className="bank-label">Account Type:</span>
              <span className="bank-value" contentEditable suppressContentEditableWarning>Current Account</span>
            </div>
          </div>
        </div>
        )}

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-label">Customer Signature</p>
            <p className="signature-date">Date: _______________</p>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <p className="signature-label">Authorized Signatory</p>
            <p className="signature-date">For Lifeasy Interior</p>
          </div>
        </div>

        {/* Footer */}
        <div className="quotation-footer">
          <p>THANKYOU FOR CHOOSING LIFEASY INTERIOR</p>
          <p className="footer-slogan" style={{ fontSize: '14px' }}>Your space, your story—beautifully designed.</p>
        </div>
      </div>
    </section>
  )
}

export default QuotePreview
