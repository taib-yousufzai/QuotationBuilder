import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION_NAME = 'quotations'

/**
 * Save or update a quotation in Firebase
 */
export const saveQuotation = async (quotationData) => {
  try {
    if (!quotationData.docNo) {
      throw new Error('Quotation number is required')
    }

    const data = {
      ...quotationData,
      updatedAt: new Date().toISOString(),
      createdAt: quotationData.createdAt || new Date().toISOString()
    }

    const docRef = doc(db, COLLECTION_NAME, quotationData.docNo)
    await setDoc(docRef, data, { merge: true })
    
    return { success: true, message: 'Quotation saved successfully!' }
  } catch (error) {
    console.error('Error saving quotation:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Load a quotation by document number
 */
export const loadQuotation = async (docNo) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, docNo)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() }
    } else {
      return { success: false, message: 'Quotation not found' }
    }
  } catch (error) {
    console.error('Error loading quotation:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get all quotations
 */
export const getAllQuotations = async () => {
  try {
    const quotationsRef = collection(db, COLLECTION_NAME)
    const q = query(quotationsRef, orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const quotations = []
    querySnapshot.forEach((doc) => {
      quotations.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, data: quotations }
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return { success: false, message: error.message, data: [] }
  }
}

/**
 * Delete a quotation
 */
export const deleteQuotation = async (docNo) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, docNo)
    await deleteDoc(docRef)
    return { success: true, message: 'Quotation deleted successfully!' }
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Search quotations by client name or project title
 */
export const searchQuotations = async (searchTerm) => {
  try {
    const result = await getAllQuotations()
    if (!result.success) return result
    
    const filtered = result.data.filter(q => 
      q.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.docNo?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return { success: true, data: filtered }
  } catch (error) {
    console.error('Error searching quotations:', error)
    return { success: false, message: error.message, data: [] }
  }
}
