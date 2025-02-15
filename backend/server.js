const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const aiAssistantRoutes = require('./routes/aiAssistant');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(compression());

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts. Try again later.'
});
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many signup attempts. Try again later.'
});

// Apply rate limits
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/signup', signupLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Telemedicine API is running...');
});

// 📄 Serve dynamically generated prescriptions
const prescriptionsDir = path.join(__dirname, '../ai-services'); // Ensure this folder exists

app.get('/api/prescription/download', (req, res) => {
  const prescriptionPath = path.join(prescriptionsDir, 'prescription.pdf');

  if (!fs.existsSync(prescriptionPath)) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  res.download(prescriptionPath, 'prescription.pdf', (err) => {
    if (err) {
      console.error('Error sending prescription:', err);
      res.status(500).json({ error: 'Failed to download prescription' });
    }
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));