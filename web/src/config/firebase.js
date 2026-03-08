import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCxQSDgd7b21UNBECNY5Ka0gTdreOYI6IU",
  authDomain: "rms-project-e5b04.firebaseapp.com",
  projectId: "rms-project-e5b04",
  storageBucket: "rms-project-e5b04.firebasestorage.app",
  messagingSenderId: "191582379120",
  appId: "1:191582379120:web:0aa97c511610fc1ed468b5",
  measurementId: "G-CCHQR5R4PF"
}

const isConfigured =
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.authDomain.length > 0 &&
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.appId.length > 0

export const firebaseReady = isConfigured

let auth = null
let googleProvider = null
let db = null

if (isConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

export { auth, googleProvider, db }
