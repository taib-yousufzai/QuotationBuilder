import { FaFilePdf, FaPrint, FaSave, FaTrash, FaList, FaSyncAlt, FaDownload, FaChevronDown, FaChartLine } from 'react-icons/fa'
import { useState } from 'react'
import { runDefaultPerformanceTests, quickPerformanceTest, exportPerformanceResults } from '../utils/performanceBenchmarks.js'

function Actions({ handleExportPDF, clearAll, autoSave, setAutoSave, staffMode, navigate, saveToFirebase, loadByNumber }) {
  const [selectedQuality, setSelectedQuality] = useState('standard')
  const [showQualityDropdown, setShowQualityDropdown] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [estimatedSize, setEstimatedSize] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false)
  const [benchmarkProgress, setBenchmarkProgress] = useState('')
  const [progressMessage, setProgressMessage] = useState('Generating PDF...')

  const qualityOptions = [
    {
      value: 'compressed',
      label: 'Compressed',
      description: 'Smallest file size (~0.5MB), good for email sharing',
      icon: '📦'
    },
    {
      value: 'standard',
      label: 'Standard',
      description: 'Balanced quality and size (~1MB), recommended',
      icon: '⚖️'
    },
    {
      value: 'high',
      label: 'High Quality',
      description: 'Best visual quality (~2MB), for presentations',
      icon: '✨'
    }
  ]

  const handleQualitySelect = (quality) => {
    setSelectedQuality(quality)
    setShowQualityDropdown(false)
    
    // Estimate file size based on quality selection
    const estimates = {
      compressed: { size: '0.3-0.7MB', time: '2-3 seconds' },
      standard: { size: '0.8-1.5MB', time: '3-4 seconds' },
      high: { size: '1.5-2.5MB', time: '4-6 seconds' }
    }
    setEstimatedSize(estimates[quality].size)
    setEstimatedTime(estimates[quality].time)
  }

  const handlePDFExport = async () => {
    setIsGeneratingPDF(true)
    setGenerationProgress(0)
    setProgressMessage('Preparing export...')
    
    try {
      const progressCallback = (data) => {
        console.log('PDF Progress:', data) // Debug log
        
        if (data.progress && typeof data.progress === 'number') {
          setGenerationProgress(Math.min(100, Math.max(0, data.progress)))
        }
        
        // Update progress message based on stage
        if (data.message) {
          setProgressMessage(data.message)
        }
        
        // Handle completion or error stages
        if (data.stage === 'complete') {
          setProgressMessage('PDF downloaded successfully!')
          setTimeout(() => {
            setIsGeneratingPDF(false)
            setGenerationProgress(0)
            setProgressMessage('Generating PDF...')
          }, 1000)
        } else if (data.stage === 'error') {
          setProgressMessage('Export failed!')
          setTimeout(() => {
            setIsGeneratingPDF(false)
            setGenerationProgress(0)
            setProgressMessage('Generating PDF...')
          }, 2000)
        }
      }
      
      await handleExportPDF({
        quality: selectedQuality,
        progressCallback,
        enableOptimization: false, // Disable heavy optimization for speed
        enableMemoryManagement: false, // Disable memory management for speed
        selectiveSections: false // Disable selective rendering for speed
      })
      
      // Fallback cleanup in case the progress callback doesn't trigger
      setTimeout(() => {
        setIsGeneratingPDF(false)
        setGenerationProgress(0)
        setProgressMessage('Generating PDF...')
      }, 3000)
      
    } catch (error) {
      console.error('PDF export failed:', error)
      alert(`PDF export failed: ${error.message}`)
      setIsGeneratingPDF(false)
      setGenerationProgress(0)
      setProgressMessage('Generating PDF...')
    }
  }

  const handleRunBenchmark = async () => {
    setIsRunningBenchmark(true)
    setBenchmarkProgress('Initializing benchmark...')
    
    try {
      const previewElement = document.getElementById('previewArea')
      if (!previewElement) {
        alert('Preview area not found. Please ensure content is loaded.')
        return
      }

      setBenchmarkProgress('Running quick performance test...')
      
      // Run a quick performance test first
      const quickResult = await quickPerformanceTest(previewElement, {
        quality: selectedQuality,
        enableOptimization: true
      })

      setBenchmarkProgress('Running comprehensive benchmark suite...')
      
      // Run the full benchmark suite
      const fullResults = await runDefaultPerformanceTests({
        onProgress: (data) => {
          if (data.suiteName) {
            setBenchmarkProgress(`Running: ${data.suiteName}`)
          } else if (data.testName) {
            setBenchmarkProgress(`Testing: ${data.testName}`)
          }
        }
      })

      // Export results to console
      console.log('=== Performance Benchmark Results ===')
      console.log('Quick Test Result:', quickResult)
      exportPerformanceResults(fullResults)

      // Show summary to user
      const summary = fullResults.summary
      const message = `Performance Benchmark Complete!\n\n` +
        `Test Suites: ${summary.successfulSuites}/${summary.totalSuites} passed\n` +
        `Individual Tests: ${summary.successfulTests}/${summary.totalTests} passed\n` +
        `Overall Success Rate: ${Math.round(summary.overallSuccessRate)}%\n\n` +
        `Recommendations:\n${fullResults.recommendations.join('\n')}\n\n` +
        `Detailed results have been logged to the browser console.`

      alert(message)

    } catch (error) {
      console.error('Benchmark failed:', error)
      alert(`Benchmark failed: ${error.message}`)
    } finally {
      setIsRunningBenchmark(false)
      setBenchmarkProgress('')
    }
  }
  return (
    <div>
      <div className="actions">
        <div className="pdf-export-section">
          <div className="pdf-quality-selector">
            <button 
              className={`btn-quality-dropdown ${showQualityDropdown ? 'active' : ''}`}
              onClick={() => setShowQualityDropdown(!showQualityDropdown)}
              disabled={isGeneratingPDF}
            >
              <span className="quality-icon">
                {qualityOptions.find(q => q.value === selectedQuality)?.icon}
              </span>
              <span className="quality-label">
                {qualityOptions.find(q => q.value === selectedQuality)?.label}
              </span>
              <FaChevronDown className={`dropdown-arrow ${showQualityDropdown ? 'rotated' : ''}`} />
            </button>
            
            {showQualityDropdown && (
              <div className="quality-dropdown">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`quality-option ${selectedQuality === option.value ? 'selected' : ''}`}
                    onClick={() => handleQualitySelect(option.value)}
                  >
                    <div className="option-header">
                      <span className="option-icon">{option.icon}</span>
                      <span className="option-label">{option.label}</span>
                    </div>
                    <div className="option-description">{option.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="btn-primary pdf-export-btn" 
            onClick={handlePDFExport}
            disabled={isGeneratingPDF}
          >
            <FaFilePdf /> 
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
        
        {/* Progress indication */}
        {isGeneratingPDF && (
          <div className="pdf-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {progressMessage} {Math.round(generationProgress)}%
              {estimatedTime && generationProgress < 50 && (
                <span className="estimated-time"> (Est. {estimatedTime})</span>
              )}
            </div>
          </div>
        )}

        {/* Benchmark progress indication */}
        {isRunningBenchmark && (
          <div className="benchmark-progress">
            <div className="progress-bar">
              <div className="progress-fill indeterminate"></div>
            </div>
            <div className="progress-text">
              {benchmarkProgress || 'Running performance benchmark...'}
            </div>
          </div>
        )}
        
        {/* File size estimation */}
        {estimatedSize && !isGeneratingPDF && (
          <div className="size-estimation">
            Expected file size: {estimatedSize}
          </div>
        )}

        <button className="btn-secondary" onClick={() => window.print()}>
          <FaPrint /> Print
        </button>
        <button className="btn-secondary" onClick={saveToFirebase}>
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
            <button 
              className="btn-secondary benchmark-btn" 
              onClick={handleRunBenchmark}
              disabled={isRunningBenchmark || isGeneratingPDF}
              title="Run performance benchmarks to measure PDF export optimization"
            >
              <FaChartLine /> 
              {isRunningBenchmark ? 'Running...' : 'Run Benchmark'}
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
