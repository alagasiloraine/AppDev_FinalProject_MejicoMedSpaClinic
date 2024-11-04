import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Register a new user and create Firestore document
export const register = async (email, password, firstName, lastName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user);
  await createUserDocument(userCredential.user, { firstName, lastName });
  return userCredential.user;
};

// Log in the user with email and password
export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Send a password reset email
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

// Log out the user
export const logout = async () => await signOut(auth);

// Check the currently logged-in user
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Check if the current user is an admin
export const isAdmin = async () => {
  const user = auth.currentUser;
  if (!user) return false;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() && userSnap.data().role === 'admin';
};
export const resendEmailVerification = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent successfully.');
    } catch (error) {
      console.error('Error resending email verification:', error);
      throw error;
    }
  } else {
    throw new Error('No user is currently signed in');
  }
};

// Create a user document in Firestore
export const createUserDocument = async (user, additionalData = {}) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      email: user.email,
      role: 'user',
      createdAt: new Date(),
      ...additionalData,
    };
    await setDoc(userRef, userData);
  }
};