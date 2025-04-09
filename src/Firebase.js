import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA95v5xloOVfmuCktM8Q8PLm7LnK3K-6uM",
  authDomain: "library-room-booking-sys-eeb5a.firebaseapp.com",
  projectId: "library-room-booking-sys-eeb5a",
  storageBucket: "library-room-booking-sys-eeb5a.firebasestorage.app",
  messagingSenderId: "322880798352",
  appId: "1:322880798352:web:ab77294eaca8531cb92215",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
