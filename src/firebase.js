import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBr3UyThiQ_mORhyunGGXtpXPXQtZRjHY4",
  authDomain: "athlemics.firebaseapp.com",
  projectId: "athlemics",
  storageBucket: "athlemics.firebasestorage.app",
  messagingSenderId: "1114051274",
  appId: "1:1114051274:web:3f04e5473d4653af5c1a33",
  measurementId: "G-THHRVRDDLP"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);