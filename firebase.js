import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBf-V-jasXhxsaicbK7W9-h5GdWDNFunO8",
  authDomain: "scalerswiggy.firebaseapp.com",
  projectId: "scalerswiggy",
  storageBucket: "scalerswiggy.firebasestorage.app",
  messagingSenderId: "965403467837",
  appId: "1:965403467837:web:baa154b2ec93510aabca54",
  measurementId: "G-LT5YSG1YEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); 
