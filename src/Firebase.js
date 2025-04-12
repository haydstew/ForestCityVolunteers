import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBwuv2rQKDHIX_aqh378NQcnZhxGvuDWw",
  authDomain: "forest-city-volunteers.firebaseapp.com",
  projectId: "forest-city-volunteers",
  storageBucket: "forest-city-volunteers.firebasestorage.app",
  messagingSenderId: "414932803948",
  appId: "1:414932803948:web:17ab4efc9bd094e9a85349",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
