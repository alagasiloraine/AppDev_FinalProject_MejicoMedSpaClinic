const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('./firebase'); 
const { FieldValue } = require('firebase-admin').firestore;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sample route
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'OK', message: 'Mejico Clinic API is running' });
});

// Login route
app.post('/api/login', (req, res) => {
    console.log('Login request received:', req.body);
    const { email, uid } = req.body;
    console.log(`User logged in: ${email}`);
    res.json({ message: 'Login successful', user: { email, uid } });
});

// Register route
app.post('/api/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    const { email, password } = req.body; // Get email and password from request body

    try {
        // Create user without sending the default verification email
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        // Generate email verification link
        const link = await admin.auth().generateEmailVerificationLink(email);
        await sendVerificationEmail(email, link);

        console.log(`New user registered: ${email}`);
        res.json({ message: 'Registration successful. Verification email sent.', user: { email } });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Function to send verification email
async function sendVerificationEmail(email, link) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or use another email service
        auth: {
            user: 'your-email@gmail.com', // Your email
            pass: 'your-email-password', // Your email password or app-specific password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Welcome! Please verify your email by clicking the link below:</p>
               <a href="${link}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);
}

// Assuming you have Firestore initialized and the necessary imports

app.post('/api/appointments', async (req, res) => {
  const { service, date, time, price } = req.body;

  if (!service || !date || !time || !price) {
      return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
      const appointmentRef = await admin.firestore().collection('appointments').add({
          service: service,
          date: date,
          time: time,
          price: price,
          createdAt: FieldValue.serverTimestamp()
      });

      console.log(`Appointment scheduled with ID: ${appointmentRef.id}`);
      res.status(200).json({ message: 'Appointment scheduled successfully', id: appointmentRef.id });
  } catch (error) {
      console.error('Error scheduling appointment:', error);
      res.status(500).json({ error: 'Failed to schedule appointment', details: error.message });
  }
});


// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
      const appointmentsSnapshot = await admin.firestore().collection('appointments').get();
      
      if (appointmentsSnapshot.empty) {
          console.log('No appointments found.');
          return res.status(404).json({ message: 'No appointments available.' });
      }
      
      const appointments = [];
      appointmentsSnapshot.forEach(doc => appointments.push({ id: doc.id, ...doc.data() }));

      console.log('Fetched appointments:', appointments); // Log retrieved data
      res.json(appointments);
  } catch (error) {
      console.error('Error retrieving appointments:', error);
      res.status(500).json({ error: 'Failed to retrieve appointments', details: error.message });
  }
});

// Update an appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { service, date, time, price } = req.body;

  if (!service || !date || !time || !price) {
      return res.status(400).json({ error: 'All fields are required for updating the appointment.' });
  }

  try {
      const appointmentRef = admin.firestore().collection('appointments').doc(id);
      await appointmentRef.update({
          service: service,
          date: date,
          time: time,
          price: price,
          updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`Appointment with ID: ${id} updated successfully`);
      res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment', details: error.message });
  }
});






// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
