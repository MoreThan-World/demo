import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC5bMtaiXk_jel2jUTsMiTL6ntcz-qvxEc',
  authDomain: 'parta-a1.firebaseapp.com',
  projectId: 'parta-a1',
  storageBucket: 'parta-a1.firebasestorage.app',
  messagingSenderId: '181678027956',
  appId: '1:181678027956:web:9fcd141d3b265643c5d3e1',
  measurementId: 'G-GE3WDN4CMX',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
