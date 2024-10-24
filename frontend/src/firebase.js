import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAw678fyU0XcGtW4XvEAjwzmRifGh3LVTU",
    authDomain: "mejicoclinic-e03b2.firebaseapp.com",
    projectId: "mejicoclinic-e03b2",
    storageBucket: "mejicoclinic-e03b2.appspot.com",
    messagingSenderId: "178102239533",
    appId: "1:178102239533:web:ac27248ec7260ae50953a4",
    measurementId: "G-TXQLVVHV7B",
    databaseURL: "https://mejicoclinic-e03b2-default-rtdb.firebaseio.com" // Add this line
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };