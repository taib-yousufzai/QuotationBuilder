import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { consolidateItemsBySection } from './sectionConsolidator.js'

// Load image as base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}

export const exportToPDF = async (formData, rows, staffMode, currency, pageSize, orientation) => {
  const previewArea = document.getElementById('previewArea')
  if (!previewArea) return

  // Ensure rows are consolidated by section before export
  const consolidatedRows = consolidateItemsBySection(rows)

  // Hide actual columns for client mode
  if (!staffMode) {
    document.querySelectorAll('.actual-col').forEach(el => el.style.display = 'none')
  }

  // Hide action columns for PDF export
  document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none')

  // Create wrapper
  const wrapper = document.createElement('div')
  wrapper.style.padding = '10px'
  wrapper.style.background = '#fff'
  wrapper.style.width = '100%'
  wrapper.style.boxSizing = 'border-box'
  
  // Clone the preview area
  const clonedArea = previewArea.cloneNode(true)
  
  // Remove action columns from the clone
  clonedArea.querySelectorAll('.no-print').forEach(el => el.remove())
  
  // Ensure the cloned area reflects consolidated sections
  // The QuotePreview component already uses consolidateItemsBySection,
  // so the cloned content should maintain section grouping
  
  wrapper.appendChild(clonedArea)
  document.body.appendChild(wrapper)

  try {
    // Validate that section consolidation is preserved
    // Check if the cloned area maintains section grouping
    const sectionHeaders = clonedArea.querySelectorAll('.section-header-row')
    const sectionNames = new Set()
    
    sectionHeaders.forEach(header => {
      const sectionName = header.textContent.trim()
      if (sectionNames.has(sectionName)) {
        console.warn(`Duplicate section header found in export: ${sectionName}`)
      }
      sectionNames.add(sectionName)
    })

    // Load header and footer images
    const headerImg1 = await loadImageAsBase64('/quotation header page 1.png')
    const headerImg2 = await loadImageAsBase64('/quotation header page 2.png')
    const footerImg = await loadImageAsBase64('/quotation footer.png')

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      windowWidth: wrapper.scrollWidth,
    })

    document.body.removeChild(wrapper)

    const contentImg = canvas.toDataURL('image/png')
    const pdf = new jsPDF(orientation, 'mm', pageSize)
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // PAGE 1: Full page header 1
    pdf.addImage(headerImg1, 'PNG', 0, 0, pageWidth, pageHeight)

    // PAGE 2: Full page header 2
    pdf.addPage()
    pdf.addImage(headerImg2, 'PNG', 0, 0, pageWidth, pageHeight)

    // MIDDLE PAGES: Quotation content with consolidated sections
    // The content maintains section grouping as established by consolidateItemsBySection
    const imgProps = pdf.getImageProperties(contentImg)
    const imgWidth = pageWidth
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width

    let heightLeft = imgHeight
    let position = 0

    // Add first content page
    pdf.addPage()
    pdf.addImage(contentImg, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional content pages if needed
    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(contentImg, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // LAST PAGE: Full page footer
    pdf.addPage()
    pdf.addImage(footerImg, 'PNG', 0, 0, pageWidth, pageHeight)

    pdf.save(`${formData.docNo || 'Quotation'}.pdf`)
  } catch (err) {
    console.error('PDF export error:', err)
    alert('Error exporting PDF. Please ensure header and footer images are available.')
  }

  // Restore actual column visibility
  if (staffMode) {
    document.querySelectorAll('.actual-col').forEach(el => el.style.display = '')
  }

  // Restore action column visibility
  document.querySelectorAll('.no-print').forEach(el => el.style.display = '')
}
