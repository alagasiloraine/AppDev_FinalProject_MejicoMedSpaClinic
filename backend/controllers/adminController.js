import { database } from '../config/firebase.js';

// Get all registered clients
export async function getClients(req, res) {
  try {
    const usersSnapshot = await database.collection('users').where('role', '==', 'client').get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users', details: error.message });
  }
}

