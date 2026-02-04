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
const Product = require('./models/Product');
const seedDatabase = require('./utils/seedDatabase');

// Connect to MongoDB but don't block server startup
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

// Start server immediately
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // process.exit(1);
});
