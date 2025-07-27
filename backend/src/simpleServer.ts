import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { config, validateConfig } from './config';
import { connectMongoDB } from './config/simpleDatabase';
import { logger, morganStream } from './utils/simpleLogger';
import apiRoutes from './routes';
import { authErrorHandler } from './middleware/simpleAuth';

// Validate configuration
try {
  validateConfig();
  logger.info('✅ Configuration validated successfully');
} catch (error) {
  logger.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

// Create Express app
const app = express();

// Global middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Street Vendor Supplier Platform API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: {
        sendOTP: 'POST /api/auth/send-otp',
        verifyOTP: 'POST /api/auth/verify-otp',
        resendOTP: 'POST /api/auth/resend-otp',
        completeProfile: 'POST /api/auth/complete-profile',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
      },
      user: {
        profile: 'GET /api/user/profile',
        updateProfile: 'PUT /api/user/profile',
        updateLocation: 'POST /api/user/location',
      },
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(authErrorHandler);

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' ? error.message : 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  });
});

// Initialize database connections and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📱 Frontend URL: ${config.frontendUrl}`);
      logger.info(`🔗 API Base URL: ${config.apiBaseUrl}`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`📋 API Documentation: ${config.apiBaseUrl}/`);
        logger.info(`❤️  Health Check: ${config.apiBaseUrl}/api/health`);
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('👋 SIGTERM received, shutting down gracefully');
  
  try {
    // Close database connections
    await mongoose.connection.close();
    logger.info('🔒 MongoDB connection closed');
    
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT received, shutting down gracefully');
  process.emit('SIGTERM', 'SIGTERM');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export { app };
