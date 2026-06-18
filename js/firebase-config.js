/**
 * Firebase Configuration
 * Replace the config below with your own Firebase project config.
 *
 * To get your config:
 * 1. Go to https://console.firebase.google.com/
 * 2. Open your project → Project Settings → Web App
 * 3. Copy the firebaseConfig object and paste below
 */

var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
var db = firebase.firestore();
var auth = firebase.auth();

// Enable Firestore offline persistence (optional)
db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser');
  }
});

console.log('Firebase initialized');
