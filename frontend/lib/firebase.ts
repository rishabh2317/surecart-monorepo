import { initializeApp, getApps } from "firebase/app";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCS7I9epnTKrfJQmxatIy9YCEpJ1KQ1pvs",
    authDomain: "surecart-platform.firebaseapp.com",
    projectId: "surecart-platform",
    storageBucket: "surecart-platform.firebasestorage.app",
    messagingSenderId: "873550136318",
    appId: "1:873550136318:web:52731dfe413666493436af",
    measurementId: "G-9W6MWKXXYS"
  };

  // Initialize Firebase
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { firebaseApp };