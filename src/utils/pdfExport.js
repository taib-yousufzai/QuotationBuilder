import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const exportToPDF = async (formData, rows, staffMode, currency, pageSize, orientation, options = {}) => {
  // Extract optimization options with defaults
  const {
    quality = 'standard',
    progressCallback = null,
    enableOptimization = false,  // Disable heavy optimization by default
    savePreference = true,
    selectiveSections = false,   // Disable selective rendering by default
    enableMemoryManagement = false // Disable memory management by default
  } = options

  const previewArea = document.getElementById('previewArea')
  if (!previewArea) {
    throw new Error('Preview area not found')
  }

  let memoryManager = null

  // Only initialize memory management if explicitly enabled
  if (enableMemoryManagement) {
    const { MemoryManager } = await import('./memoryManager.js')
    memoryManager = new MemoryManager()
    memoryManager.start({ monitoringInterval: 1000 })
  }

  try {
    if (progressCallback) {
      progressCallback({ stage: 'preparing', progress: 10, message: 'Preparing content for export...' })
    }

    // Simple quality settings without complex analysis
    const qualitySettings = {
      compressed: { scale: 1.0, format: 'jpeg', quality: 0.6 },
      standard: { scale: 1.5, format: 'jpeg', quality: 0.8 },
      high: { scale: 2.0, format: 'png', quality: 1.0 }
    }

    const settings = qualitySettings[quality] || qualitySettings.standard

    // Hide actual columns for client mode
    if (!staffMode) {
      document.querySelectorAll('.actual-col').forEach(el => el.style.display = 'none')
    }

    // Hide action columns for PDF export
    document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none')

    if (progressCallback) {
      progressCallback({ stage: 'rendering', progress: 30, message: 'Rendering content to canvas...' })
    }

    // Simple canvas rendering without complex wrapper
    const canvas = await html2canvas(previewArea, {
      scale: settings.scale,
      useCORS: true,
      scrollY: 0,
      windowWidth: previewArea.scrollWidth,
      backgroundColor: '#ffffff'
    })

    if (progressCallback) {
      progressCallback({ stage: 'pdf_generation', progress: 70, message: 'Generating PDF document...' })
    }

    // Create PDF
    const pdf = new jsPDF(orientation, 'mm', pageSize)
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Convert canvas to image data
    const imageData = canvas.toDataURL(settings.format, settings.quality)
    const imgProps = pdf.getImageProperties(imageData)
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width

    let heightLeft = imgHeight
    let position = 0

    // Add pages as needed
    pdf.addImage(imageData, settings.format.toUpperCase(), 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imageData, settings.format.toUpperCase(), 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight
    }

    if (progressCallback) {
      progressCallback({ stage: 'saving', progress: 95, message: 'Saving PDF file...' })
    }

    // Save the PDF
    pdf.save(`${formData.docNo || 'Quotation'}.pdf`)

    if (progressCallback) {
      progressCallback({ 
        stage: 'complete', 
        progress: 100, 
        message: 'PDF export completed successfully!'
      })
    }

  } catch (err) {
    console.error('PDF export error:', err)
    
    if (progressCallback) {
      progressCallback({ 
        stage: 'error', 
        progress: 0, 
        message: 'PDF export failed',
        error: err.message 
      })
    }
    
    throw new Error(`PDF export failed: ${err.message}`)
  } finally {
    // Cleanup memory management if it was used
    if (memoryManager) {
      memoryManager.stop()
    }

    // Restore column visibility
    if (staffMode) {
      document.querySelectorAll('.actual-col').forEach(el => el.style.display = '')
    }
    document.querySelectorAll('.no-print').forEach(el => el.style.display = '')
  }
}

/**
 * Enhanced PDF export function with built-in progress tracking
 * @param {Object} formData - Form data for the quotation
 * @param {Array} rows - Quotation rows data  
 * @param {boolean} staffMode - Whether in staff mode
 * @param {string} currency - Currency setting
 * @param {string} pageSize - PDF page size
 * @param {string} orientation - PDF orientation
 * @param {Object} options - Export options including progress callbacks
 * @returns {Promise} Promise that resolves when export is complete
 */
export const exportToPDFWithProgress = async (formData, rows, staffMode, currency, pageSize, orientation, options = {}) => {
  // Use the simplified export function
  return exportToPDF(formData, rows, staffMode, currency, pageSize, orientation, options)
}

/**
 * Export PDF with specific quality preset
 * @param {string} presetId - Quality preset ID ('compressed', 'standard', 'high')
 * @param {Object} formData - Form data for the quotation
 * @param {Array} rows - Quotation rows data
 * @param {boolean} staffMode - Whether in staff mode
 * @param {string} currency - Currency setting
 * @param {string} pageSize - PDF page size
 * @param {string} orientation - PDF orientation
 * @param {Object} additionalOptions - Additional export options
 * @returns {Promise} Promise that resolves when export is complete
 */
export const exportToPDFWithPreset = async (presetId, formData, rows, staffMode, currency, pageSize, orientation, additionalOptions = {}) => {
  const options = {
    quality: presetId,
    savePreference: true,
    ...additionalOptions
  }
  
  return exportToPDF(formData, rows, staffMode, currency, pageSize, orientation, options)
}