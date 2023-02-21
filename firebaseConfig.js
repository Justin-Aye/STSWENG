
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3gknBKtYUdObP8-Pgtgjbk3mH4snh0jk",
    authDomain: "practice-a80a2.firebaseapp.com",
    projectId: "practice-a80a2",
    storageBucket: "practice-a80a2.appspot.com",
    messagingSenderId: "241177419412",
    appId: "1:241177419412:web:c15ec4b70258dcf878de81"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app); //Can export 
export const db = getFirestore(app);
export const auth = getAuth(app);