const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const exportRoutes = require('./routes/export');
const historyRoutes = require('./routes/history');

// Import models & utils
const Product = require('./models/Product');
const seedDatabase = require('./utils/seedDatabase');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: dbStatus === 1 ? 'OK' : 'ERROR',
    message: dbStatus === 1 ? 'TCVN API is running' : 'Database not connected',
    dbState: dbStates[dbStatus] || 'unknown'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcvn-system';

const mongooseOptions = {
  family: 4 // Use IPv4, skip IPv6
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(async () => {
    console.log('✅ MongoDB connected successfully');

    // Auto-seed if database doesn't have the new rich data
    const hasRichData = await Product.findOne({ name: 'Cà phê bột - Rang xay nguyên chất' });
    if (!hasRichData) {
      console.log('⚠️ Rich VNTR data missing. Running auto-seed/re-seed...');
      await seedDatabase(false);
      console.log('✅ Seed/Re-seed completed');
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
