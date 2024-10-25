import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await createUserDocument(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, 
      user => {
        unsubscribe();
        resolve(user);
      }, 
      error => {
        unsubscribe();
        reject(error);
      }
    );
  });
};

export const resendEmailVerification = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error resending email verification:', error);
      throw error;
    }
  } else {
    throw new Error('No user is currently signed in');
  }
};

export const isAdmin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === 'admin';
    } else {
      console.error('User document does not exist in Firestore');
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData = {
        email: user.email,
        role: 'user', // Default role
        createdAt: new Date(),
        ...additionalData
      };

      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};