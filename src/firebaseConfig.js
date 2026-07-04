// ===================================================================
// FIREBASE CONFIG — Gospel Connection backend
// -------------------------------------------------------------------
// 1. Go to https://console.firebase.google.com
// 2. Create a free project (name it anything, e.g. "integrity-records")
// 3. Add a Web App inside that project
// 4. Firebase will show you a config object like the one below —
//    copy your real values into the placeholders here
// 5. In the Firebase console, enable Firestore Database
//    (start in "test mode" to begin)
// ===================================================================

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

