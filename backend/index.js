const db = require('./config/firebase'); // Firestore setup
const express = require('express');
const cors = require('cors');
const app = express();
const adminRoutes = require('./routes/adminRoutes'); // Make sure the path is correct
const authRoutes = require('./routes/authRoutes');

app.use(cors()); // Apply CORS middleware
app.use(express.json()); // Middleware to parse JSON

// Mount routes
app.use('/api/admin', adminRoutes);  // Note the /api/admin path
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
