const admin = require('firebase-admin');

const serviceAccount = require('./config/serviceAccountKey.json'); // Replace with the actual path to your Firebase credentials file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://mejicoclinic-e03b2-default-rtdb.firebaseio.com" // Add this line
});

// Export the initialized Firebase admin instance for use in other files
module.exports = admin;