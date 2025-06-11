// MANTENHA TODOS OS SEUS IMPORTS
import { initializeApp, getApps, getApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// COLE A SUA NOVA CONFIGURAÇÃO AQUI
const firebaseConfig = {
  apiKey: "AIzaSyDlMGRFT2aB3k0ow7-0i3bRpdkFSa7AiaU",
  authDomain: "mobile-lengends-b1755.firebaseapp.com",
  projectId: "mobile-lengends-b1755",
  storageBucket: "mobile-lengends-b1755.firebasestorage.app",
  messagingSenderId: "523351753325",
  appId: "1:523351753325:web:cee98dce0ab4172eaab564",
  measurementId: "G-NF66Q3EM73"
};

// MANTENHA O RESTO DO SEU CÓDIGO IGUAL
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app); // Esta linha pode ou não existir no seu ficheiro original
const storage = getStorage(app);
const functions = getFunctions(app);

// MANTENHA AS SUAS EXPORTAÇÕES
export { app, auth, db, analytics, storage, functions };