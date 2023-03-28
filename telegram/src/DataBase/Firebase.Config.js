import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getDatabase } from "firebase/database"
const firebaseConfig = {
  apiKey: "AIzaSyBTuhTseBVTywF-0LFZKwOJkYW5Jqz99-8",
  authDomain: "telegram-26a2c.firebaseapp.com",
  projectId: "telegram-26a2c",
  storageBucket: "telegram-26a2c.appspot.com",
  messagingSenderId: "541928718931",
  appId: "1:541928718931:web:6988caecbb7f65d8a3bca6",
  measurementId: "G-6NZELT9JXY"
};
const app = initializeApp(firebaseConfig);
export const dbAuth = getAuth(app)
export const realTimeDb = getDatabase(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

