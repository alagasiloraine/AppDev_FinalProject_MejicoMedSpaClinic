const db = require('../config/firebase');

// Get all registered clients
exports.getClients = async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').where('role', '==', 'client').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send('Error retrieving users: ' + error.message);
  }
};
