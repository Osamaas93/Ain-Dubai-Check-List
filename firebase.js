// firebase.js (no changes needed)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyB733mGTCNbbqx-QBS6KnxhgBM3bwC0Ze4",
    authDomain: "ain-dubai-schedule.firebaseapp.com",
    projectId: "ain-dubai-schedule",
    storageBucket: "ain-dubai-schedule.firebasestorage.app",
    messagingSenderId: "933088072381",
    appId: "1:933088072381:web:f619b34b84f7e941209dd4",
    measurementId: "G-CS5R623Q3G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };