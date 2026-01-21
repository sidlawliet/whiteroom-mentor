import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNsonDDh3ZD_L38zqHsiEmzv9OKQUVSUg",
  authDomain: "white-room-738a7.firebaseapp.com",
  projectId: "white-room-738a7",
  storageBucket: "white-room-738a7.firebasestorage.app",
  messagingSenderId: "486971286936",
  appId: "1:486971286936:web:1bb1f281ecc33bd58d77ed"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();