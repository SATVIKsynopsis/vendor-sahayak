import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/simpleLogger';
import { simpleSmsService } from './services/simpleSmsService';

const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Store OTPs temporarily (in production, use database)
const otpStore = new Map<string, { otp: string; expires: number }>();

// Generate OTP function
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple OTP route with actual SMS sending
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { mobileNumber, language } = req.body;
    
    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    logger.info(`OTP request for: ${mobileNumber}`);
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with 10 minute expiry
    otpStore.set(mobileNumber, {
      otp,
      expires: Date.now() + (10 * 60 * 1000) // 10 minutes
    });
    
    // Send SMS
    const smsResult = await simpleSmsService.sendOTP(mobileNumber, otp, language || 'english');
    
    if (smsResult.success) {
      logger.info(`✅ OTP sent successfully to ${mobileNumber}`);
      res.json({
        success: true,
        message: 'OTP sent successfully',
        mobile: mobileNumber?.replace(/(\d{2})(\d{8})(\d{2})/, '$1******$3'),
      });
    } else {
      logger.error(`❌ Failed to send OTP to ${mobileNumber}: ${smsResult.message}`);
      res.status(500).json({
        success: false,
        message: smsResult.message || 'Failed to send OTP',
      });
    }
  } catch (error: any) {
    logger.error('Error in send-otp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Verify OTP endpoint for testing
app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    
    const stored = otpStore.get(mobileNumber);
    
    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this number',
      });
    }
    
    if (Date.now() > stored.expires) {
      otpStore.delete(mobileNumber);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    
    // Remove used OTP
    otpStore.delete(mobileNumber);
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        mobileNumber,
        isNewUser: true,
      },
    });
  } catch (error: any) {
    logger.error('Error in verify-otp:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Start server
const PORT = config.port || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Test server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
