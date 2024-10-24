const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Parse JSON bodies
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
  // Here you would typically verify the user's token with Firebase
  // and perform any necessary operations in your database
  console.log(`User logged in: ${email}`);
  res.json({ message: 'Login successful', user: { email, uid } });
});

// Register route
app.post('/api/register', (req, res) => {
  console.log('Registration request received:', req.body);
  const { email, uid } = req.body;
  // Here you would typically store the new user in your database
  console.log(`New user registered: ${email}`);
  res.json({ message: 'Registration successful', user: { email, uid } });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});