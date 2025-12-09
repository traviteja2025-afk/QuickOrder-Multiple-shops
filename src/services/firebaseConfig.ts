import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

// Configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyCcQfCz8fichiUVXmpk8N8g5H6SfecQhrs",
  authDomain: "quickordershops.firebaseapp.com",
  projectId: "quickordershops",
  storageBucket: "quickordershops.firebasestorage.app",
  messagingSenderId: "687083162314",
  appId: "1:687083162314:web:ec21390e4227ca49a94233",
  measurementId: "G-H9C6FXEN23"
};

// Flag to tell App.tsx that configuration is present
export const isFirebaseConfigured = true;

// --- ROOT ADMINS (SUPER USERS) ---
// These users ALWAYS have access, even if database is empty.
export const ROOT_ADMIN_EMAILS = [
    "admin@example.com", 
    "t.raviteja2025@gmail.com", 
];

export const ROOT_ADMIN_PHONES = [
    "9876543210", 
];

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const analytics = firebase.analytics();

export default firebase;