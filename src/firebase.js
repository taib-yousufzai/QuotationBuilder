import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration for quotation-builder-lifeasy project
const firebaseConfig = {
  apiKey: "AIzaSyDCtIWSVvjbfzDOcsY_0pc391VpSMihTzo",
  authDomain: "quotation-builder-lifeasy.firebaseapp.com",
  projectId: "quotation-builder-lifeasy",
  storageBucket: "quotation-builder-lifeasy.firebasestorage.app",
  messagingSenderId: "795827479376",
  appId: "1:795827479376:web:1da5b40f0215590e4ec255"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
