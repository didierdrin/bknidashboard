// firebaseApp.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBxU9tcwP4Jf52jDYcHdHfzyukw0h1nKRE",
    authDomain: "bukoni-6b0b3.firebaseapp.com",
    projectId: "bukoni-6b0b3",
    storageBucket: "bukoni-6b0b3.appspot.com",
    messagingSenderId: "306097629999",
    appId: "1:306097629999:web:0b99fabaa9b8dba8e48fda",
    measurementId: "G-VTMDRPY06W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
