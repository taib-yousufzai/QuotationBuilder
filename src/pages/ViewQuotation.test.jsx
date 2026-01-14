import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ViewQuotation from './ViewQuotation'
import * as copyQuotationService from '../utils/copyQuotationService'

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {}
}))

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn()
}))

// Mock the copy quotation service
vi.mock('../utils/copyQuotationService', () => ({
  copyQuotationToBuilder: vi.fn(),
  createCopyUrlParams: vi.fn()
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-quotation-id' })
  }
})

// Mock window functions
global.alert = vi.fn()
global.confirm = vi.fn()
global.prompt = vi.fn()

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

// Mock window.print
global.print = vi.fn()

const mockQuotation = {
  id: 'test-quotation-id',
  docNo: 'LI-0001',
  date: '2024-01-15',
  clientName: 'Test Client',
  location: 'Test Location',
  projectTitle: 'Test Project',
  discount: 10,
  handling: 5,
  tax: 18,
  terms: 'Test terms',
  rows: [
    {
      section: 'KITCHEN',
      name: 'Test Item',
      description: 'Test Description',
      unit: 'sqft',
      qty: 10,
      rateClient: 1000,
      rateActual: 800,
      remark: 'Test remark'
    }
  ],
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z'
}

describe('ViewQuotation Copy Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue(null)
    global.prompt.mockReturnValue(null) // Skip admin password prompt
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderViewQuotation = () => {
    return render(
      <BrowserRouter>
        <ViewQuotation />
      </BrowserRouter>
    )
  }

  it('should render Copy to Builder button', async () => {
    // Mock successful quotation loading
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'test-quotation-id',
      data: () => mockQuotation
    })

    renderViewQuotation()

    await waitFor(() => {
      expect(screen.getByText('Copy to Builder')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy to Builder')
    expect(copyButton).toBeInTheDocument()
    expect(copyButton.closest('button')).toHaveAttribute('title', 'Copy this quotation to the builder for editing')
  })

  it('should handle copy to builder functionality', async () => {
    // Mock successful quotation loading
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'test-quotation-id',
      data: () => mockQuotation
    })

    // Mock copy service functions
    const mockCopiedData = { ...mockQuotation, docNo: 'LI-0002' }
    copyQuotationService.copyQuotationToBuilder.mockReturnValue(mockCopiedData)
    copyQuotationService.createCopyUrlParams.mockReturnValue('copy=test-quotation-id')

    renderViewQuotation()

    await waitFor(() => {
      expect(screen.getByText('Copy to Builder')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy to Builder')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(copyQuotationService.copyQuotationToBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-quotation-id',
          docNo: 'LI-0001'
        })
      )
    })

    expect(copyQuotationService.createCopyUrlParams).toHaveBeenCalledWith('test-quotation-id')
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'copiedQuotationData',
      JSON.stringify(mockCopiedData)
    )
    expect(global.alert).toHaveBeenCalledWith('Quotation LI-0001 copied successfully! Redirecting to builder...')
    expect(mockNavigate).toHaveBeenCalledWith('/?copy=test-quotation-id')
  })

  it('should handle copy button disabled state during operation', async () => {
    // Mock successful quotation loading
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'test-quotation-id',
      data: () => mockQuotation
    })

    // Mock copy service functions
    const mockCopiedData = { ...mockQuotation, docNo: 'LI-0002' }
    copyQuotationService.copyQuotationToBuilder.mockReturnValue(mockCopiedData)
    copyQuotationService.createCopyUrlParams.mockReturnValue('copy=test-quotation-id')

    renderViewQuotation()

    await waitFor(() => {
      expect(screen.getByText('Copy to Builder')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy to Builder')
    
    // Verify button is initially enabled
    expect(copyButton.closest('button')).not.toBeDisabled()
    expect(copyButton.closest('button')).toHaveStyle({ opacity: '1' })
    
    fireEvent.click(copyButton)

    // Verify copy operation was called
    await waitFor(() => {
      expect(copyQuotationService.copyQuotationToBuilder).toHaveBeenCalled()
    })
  })

  it('should handle copy operation errors', async () => {
    // Mock successful quotation loading
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'test-quotation-id',
      data: () => mockQuotation
    })

    // Mock copy service to throw error
    const errorMessage = 'Copy operation failed'
    copyQuotationService.copyQuotationToBuilder.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    renderViewQuotation()

    await waitFor(() => {
      expect(screen.getByText('Copy to Builder')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy to Builder')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(`Error copying quotation: ${errorMessage}`)
    })

    // Button should be enabled again after error
    expect(copyButton).not.toBeDisabled()
    expect(copyButton.closest('button')).toHaveStyle({ opacity: '1' })
  })

  it('should integrate with copy service utilities correctly', async () => {
    // Mock successful quotation loading
    const { getDoc } = await import('firebase/firestore')
    getDoc.mockResolvedValue({
      exists: () => true,
      id: 'test-quotation-id',
      data: () => mockQuotation
    })

    const mockCopiedData = {
      ...mockQuotation,
      docNo: 'LI-0002',
      date: '2024-01-16'
    }
    copyQuotationService.copyQuotationToBuilder.mockReturnValue(mockCopiedData)
    copyQuotationService.createCopyUrlParams.mockReturnValue('copy=test-quotation-id')

    renderViewQuotation()

    await waitFor(() => {
      expect(screen.getByText('Copy to Builder')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy to Builder')
    fireEvent.click(copyButton)

    await waitFor(() => {
      // Verify copy service was called with correct quotation data
      expect(copyQuotationService.copyQuotationToBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          docNo: 'LI-0001',
          clientName: 'Test Client',
          rows: expect.arrayContaining([
            expect.objectContaining({
              section: 'KITCHEN',
              name: 'Test Item'
            })
          ])
        })
      )

      // Verify URL params were created correctly
      expect(copyQuotationService.createCopyUrlParams).toHaveBeenCalledWith('test-quotation-id')

      // Verify session storage was used correctly
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'copiedQuotationData',
        JSON.stringify(mockCopiedData)
      )
    })
  })
})