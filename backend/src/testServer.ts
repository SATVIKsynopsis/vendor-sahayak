import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/simpleLogger';
import { connectMongoDB } from './config/simpleDatabase';

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Street Vendor API is running',
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check passed',
    mongodb: 'connected',
  });
});

// Basic OTP send endpoint for testing
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobileNumber, language = 'english' } = req.body;
    
    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // For now, just log and return success
    logger.info(`📱 Mock OTP sent to ${mobileNumber} in ${language}`);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      mobile: mobileNumber.replace(/(\d{2})\d{6}(\d{4})/, '$1******$2'),
    });
    
  } catch (error: any) {
    logger.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Skip MongoDB connection for now
    logger.info('⚠️  MongoDB connection skipped for testing');
    
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`🌍 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🔗 API URL: http://localhost:${config.port}`);
      logger.info(`📋 Test endpoint: http://localhost:${config.port}/api/auth/send-otp`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
