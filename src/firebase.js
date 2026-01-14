import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from "firebase/analytics";

// Firebase configuration for Morphium Quotation Builder
const firebaseConfig = {
  apiKey: "AIzaSyBBJ8Ynv2MyESrCp8hY34X5tHK6CMDGosQ",
  authDomain: "quotation-builder-ff35b.firebaseapp.com",
  projectId: "quotation-builder-ff35b",
  storageBucket: "quotation-builder-ff35b.firebasestorage.app",
  messagingSenderId: "319439662904",
  appId: "1:319439662904:web:b118655dcee0349bae9bcd",
  measurementId: "G-MVEKYC4HVH"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app);
