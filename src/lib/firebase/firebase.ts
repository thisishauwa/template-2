import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBVyUMzXRoroSsbsm5EppJPXzHj6p56gI",
  authDomain: "anonymous-august.firebaseapp.com",
  projectId: "anonymous-august",
  storageBucket: "anonymous-august.appspot.com",
  messagingSenderId: "546955639484",
  appId: "1:546955639484:web:3092cd69e8b0ee759faeb9",
  measurementId: "G-VWVJ0JGM3W"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(error => {
    console.log('Analytics not supported or blocked:', error);
  });
}

export { app, auth, db, storage, analytics };
