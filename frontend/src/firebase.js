import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBmW5FT1Tb2XKCneqiYwNx2PvO0C9tpCDE",
  authDomain: "mejicoproject.firebaseapp.com",
  projectId: "mejicoproject",
  storageBucket: "mejicoproject.appspot.com",
  messagingSenderId: "79452955292",
  appId: "1:79452955292:web:169ceab1f62f4dd8b00359",
  measurementId: "G-SPTET752SM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);
const storage = getStorage(app); 

export { auth, database, storage };

