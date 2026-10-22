import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyBtLDiTAXUFA-5nG3Be93uUcsZ2TPXMGyo",
  authDomain: "e-book-selling-90184.firebaseapp.com",
  projectId: "e-book-selling-90184",
  storageBucket: "e-book-selling-90184.firebasestorage.app",
  messagingSenderId: "540156616086",
  appId: "1:540156616086:web:d4aa716a82e8d0735c91b7",
  measurementId: "G-HQK1R94NDE"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Default Admin Credentials as requested
export const ADMIN_CREDENTIALS = {
  email: "ap5487060@gmail.com",
  password: "Abhishek@8957",
  name: "Abhishek (Super Admin)"
};

export {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
};
