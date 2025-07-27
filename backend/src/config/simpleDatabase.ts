import mongoose from 'mongoose';
import { logger } from '../utils/simpleLogger';

// MongoDB Configuration
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/streetvendor';
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoUri, options);
    
    logger.info('✅ MongoDB connected successfully');
    
    // Create indexes after connection
    await createIndexes();
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create necessary database indexes
const createIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // User indexes
    await db.collection('users').createIndex({ mobileNumber: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ 'location.coordinates': '2dsphere' });
    
    // OTP verification indexes
    await db.collection('otpverifications').createIndex({ mobileNumber: 1, isUsed: 1 });
    await db.collection('otpverifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error('❌ Failed to create database indexes:', error);
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
