// src/services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // <-- Adicione esta linha!

const firebaseConfig = {
  apiKey: "AIzaSyAdVq1Aw5Gq3KAD25wG7I05u1vrkrukn7Y",
  authDomain: "mobile-legends-615e9.firebaseapp.com",
  projectId: "mobile-legends-615e9",
  storageBucket: "mobile-legends-615e9.firebasestorage.app",
  messagingSenderId: "372325609069",
  appId: "1:372325609069:web:023c93fcde9d9f1a689964",
  measurementId: "G-XRSP32H893"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app); // <-- Adicione esta linha para inicializar o Storage!

// Exportar todos os serviços que precisa usar noutros ficheiros
export { app, auth, db, analytics, storage }; // <-- Adicione 'storage' aqui!