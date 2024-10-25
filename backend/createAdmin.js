const { db } = require('./config/firebase'); // Update this to the correct path
const { getAuth } = require('firebase-admin/auth');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.addAdminRole = functions.https.onCall((data, context) => {
  // Check that the request is made by an authenticated user
  if (context.auth.token.admin !== true) {
    return { error: 'Only admins can add other admins' };
  }

  // Get the user by email and add the admin claim
  return admin.auth().getUserByEmail(data.email)
    .then((user) => {
      return admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      });
    })
    .then(() => {
      return { message: `Success! ${data.email} has been made an admin.` };
    })
    .catch((error) => {
      return { error: error.message };
    });
});

// Function to create a default admin user
const createDefaultAdmin = async () => {
  const email = 'admin@gmail.com';
  const password = '1234Admin';

  try {
    // Create a new user in Firebase Authentication
    const userRecord = await getAuth().createUser({
      email,
      password,
    });

    // Store user details in Firestore with the role of 'admin'
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'admin',
    });

    console.log('Default admin created successfully');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Admin account already exists');
    } else {
      console.error('Error creating default admin:', error.message);
    }
  }
};

// Call the function to create the default admin
createDefaultAdmin()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
