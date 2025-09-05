import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Paste your actual config from Firebase console here
  apiKey: "AIzaSyD3DeA9Y7mhtrl0uieNLtBO-HMszTFixN8",
  authDomain: "desk-booking-fe246.firebaseapp.com",
  projectId: "desk-booking-fe246",
  storageBucket: "desk-booking-fe246.firebasestorage.app",
  messagingSenderId: "775505167430",
  appId: "1:775505167430:web:0a35a6db63c4d3f680b647"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
