import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmPfH2SjJWW4m5epbDDnY-_FE3nYSG5Sw",
  authDomain: "quotationbuilder-d79e9.firebaseapp.com",
  projectId: "quotationbuilder-d79e9",
  storageBucket: "quotationbuilder-d79e9.firebasestorage.app",
  messagingSenderId: "79503850976",
  appId: "1:79503850976:web:9ca0469b0ec4d6c251bf85",
  measurementId: "G-60K90EZWQ6"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser environment)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}
export { analytics }
