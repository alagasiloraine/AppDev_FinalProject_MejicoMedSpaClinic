import { auth, database } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  applyActionCode
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const register = async (email, password, firstName, lastName, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await sendEmailVerification(user);
    await createUserDocument(user, { firstName, lastName, username });
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in.');
    }
    const userRole = await getUserRole(user.uid);
    localStorage.setItem('userRole', userRole);
    return { user, role: userRole };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('userRole');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
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

export const isAdmin = async () => {
  const user = auth.currentUser;
  if (!user) return false;
  const userRole = await getUserRole(user.uid);
  return userRole === 'admin';
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const verifyEmail = async (actionCode) => {
  try {
    await applyActionCode(auth, actionCode);
    const user = auth.currentUser;
    if (user) {
      await updateUserVerificationStatus(user.uid, true);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

const createUserDocument = async (user, additionalData = {}) => {
  const userRef = doc(database, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      email: user.email,
      uid: user.uid,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      username: additionalData.username,
      role: 'client', // Default role is client
      registrationDate: new Date().toISOString(),
    };
    await setDoc(userRef, userData);
  }
};

const getUserRole = async (uid) => {
  const userRef = doc(database, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data().role : 'client';
};

const updateUserVerificationStatus = async (uid, isVerified) => {
  const userRef = doc(database, 'users', uid);
  await updateDoc(userRef, { isVerified });
};