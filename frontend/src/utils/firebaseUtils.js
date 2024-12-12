import { doc, getDoc } from 'firebase/firestore';
import { database } from '../firebase';

export async function getUserEmail(userId) {
  try {
    const userRef = doc(database, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.email || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

