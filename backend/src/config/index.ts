import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/streetvendor',
  },

  // Authentication Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // SMS Configuration (Simple APIs for India)
  sms: {
    // 2Factor SMS API (Recommended for India)
    twoFactorApiKey: process.env.SMS_API_KEY,
    twoFactorApiUrl: process.env.SMS_API_URL || 'https://2factor.in/API/V1',
    
    // MSG91 API (Alternative)
    msg91ApiKey: process.env.MSG91_API_KEY,
    msg91ApiUrl: process.env.MSG91_API_URL || 'https://api.msg91.com/api',
    
    // Fast2SMS API (Alternative)
    fast2smsApiKey: process.env.FAST2SMS_API_KEY,
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    otpMaxAttempts: parseInt(process.env.OTP_RATE_LIMIT_MAX || '5', 10),
    otpWindowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS || '600000', 10), // 10 minutes
  },

  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 3,
    resendCooldownMinutes: 2,
  },

  // Security Configuration
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
  },

  // Application Features
  features: {
    enableSMS: true, // Always enable SMS for OTP
  },
};

// Validate required environment variables
export const validateConfig = (): void => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // In development, we'll use mock SMS service, so no SMS API key required
  if (config.nodeEnv === 'production' && config.features.enableSMS) {
    const hasAnySmsConfig = config.sms.twoFactorApiKey || 
                           config.sms.msg91ApiKey || 
                           config.sms.fast2smsApiKey;
    
    if (!hasAnySmsConfig) {
      console.warn('Warning: No SMS service configured in production. OTPs will be logged to console.');
    }
  }
};

export default config;
