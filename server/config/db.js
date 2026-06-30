const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt database connection with a low timeout (3 seconds) to fail quickly if not running
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-resume-builder',
      {
        serverSelectionTimeoutMS: 3000,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_MOCK_DB = 'false';
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log('\n======================================================');
    console.log('WARNING: MongoDB is not running or accessible.');
    console.log('The backend is automatically falling back to IN-MEMORY MOCK DATABASE.');
    console.log('All features will work (Auth, Resume CRUD, AI assistant) in this session.');
    console.log('======================================================\n');
    process.env.USE_MOCK_DB = 'true';
  }
};

module.exports = connectDB;
