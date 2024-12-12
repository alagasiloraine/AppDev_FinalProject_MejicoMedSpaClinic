import { getAuth } from 'firebase-admin/auth';
import { database } from '../config/firebase.js';

// User registration
export async function register(req, res) {
    const { email, password, role } = req.body;

    try {
        // Create the user in Firebase Authentication
        const userRecord = await getAuth().createUser({ email, password });
        
        // Store user details in Firestore
        await database.collection('users').doc(userRecord.uid).set({ email, role });
        
        // Send email verification link
        const link = await getAuth().generateEmailVerificationLink(email);
        // Send email using your preferred email service (e.g., nodemailer)
        // await sendVerificationEmail(email, link); // Uncomment and implement this function

        res.status(201).json({ message: 'User registered successfully, verification email sent' });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
}

// User login
export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await getAuth().getUserByEmail(email);
        // Implement password validation logic here
        return res.status(200).json({
            message: 'Login successful',
            user: {
                uid: user.uid,
                email: user.email,
                role: 'client', // Fetch actual role from Firestore
            },
        });
    } catch (error) {
        console.error('Login error: ', error.message);
        return res.status(401).json({ message: 'Invalid email or password' });
    }
}

// Reset password
export async function resetPassword(req, res) {
    const { email } = req.body;

    try {
        const link = await getAuth().generatePasswordResetLink(email);
        // Send email using your preferred email service (e.g., nodemailer)
        // await sendResetEmail(email, link); // Uncomment and implement this function
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error sending reset link:', error.message);
        res.status(500).json({ error: 'Error sending reset link', details: error.message });
    }
}

