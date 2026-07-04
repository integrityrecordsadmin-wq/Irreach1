// FIREBASE CONFIG — Gospel Connection backend

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyzCIQcXgcwvfb_K_sOatIvLvv2Z-ap_k",
  authDomain: "integrity-records.firebaseapp.com",
  projectId: "integrity-records",
  storageBucket: "integrity-records.firebasestorage.app",
  messagingSenderId: "750132842762",
  appId: "1:750132842762:web:fc20342d9af905fd70eaf3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
