import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { jwtService } from '../services/authService';
import { User } from '../models/User';
import { logger } from '../utils/simpleLogger';
import { config } from '../config';
import { AuthenticatedRequest } from '../controllers/authController';

/**
 * JWT Authentication Middleware
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      mobileNumber: decoded.mobileNumber,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.message === 'Access token expired') {
      res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid access token',
    });
  }
};

/**
 * Optional JWT Authentication Middleware
 * If token is provided, it will be validated, but it's not required
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = jwtService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            userId: decoded.userId,
            mobileNumber: decoded.mobileNumber,
          };
        }
      } catch (error) {
        // Token is invalid but we don't fail the request
        logger.warn('Invalid optional token:', error);
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue without authentication
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return config.nodeEnv === 'development';
  },
});

/**
 * Strict rate limiting for OTP endpoints
 */
export const otpRateLimit = rateLimit({
  windowMs: config.rateLimit.otpWindowMs, // 10 minutes
  max: config.rateLimit.otpMaxAttempts, // 5 attempts
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later',
  },
  keyGenerator: (req) => {
    // Rate limit by mobile number if provided, otherwise by IP
    return req.body.mobileNumber || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return config.nodeEnv === 'development';
  },
});

/**
 * Middleware to validate mobile number format
 */
export const validateMobileNumber = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    res.status(400).json({
      success: false,
      message: 'Mobile number is required',
    });
    return;
  }

  // Validate mobile number format (international format)
  const mobileRegex = /^\+[1-9]\d{1,14}$/;
  if (!mobileRegex.test(mobileNumber)) {
    res.status(400).json({
      success: false,
      message: 'Invalid mobile number format. Use international format (e.g., +919876543210)',
    });
    return;
  }

  next();
};

/**
 * Middleware to validate OTP format
 */
export const validateOTP = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { otp } = req.body;

  if (!otp) {
    res.status(400).json({
      success: false,
      message: 'OTP is required',
    });
    return;
  }

  // Validate OTP format (6 digits)
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP format. OTP must be 6 digits',
    });
    return;
  }

  next();
};

/**
 * Middleware to validate user profile data
 */
export const validateUserProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, businessType, location } = req.body;

  // Validate name
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters',
      });
      return;
    }
  }

  // Validate business type
  if (businessType !== undefined) {
    const validBusinessTypes = ['street_vendor', 'small_shop', 'retailer', 'wholesaler'];
    if (!validBusinessTypes.includes(businessType)) {
      res.status(400).json({
        success: false,
        message: `Business type must be one of: ${validBusinessTypes.join(', ')}`,
      });
      return;
    }
  }

  // Validate location
  if (location !== undefined) {
    const { city, state, pincode, coordinates } = location;

    if (city && (typeof city !== 'string' || city.trim().length < 2)) {
      res.status(400).json({
        success: false,
        message: 'City name must be at least 2 characters',
      });
      return;
    }

    if (state && (typeof state !== 'string' || state.trim().length < 2)) {
      res.status(400).json({
        success: false,
        message: 'State name must be at least 2 characters',
      });
      return;
    }

    // Validate Indian pincode format
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pincode format',
      });
      return;
    }

    // Validate coordinates
    if (coordinates) {
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        res.status(400).json({
          success: false,
          message: 'Coordinates must be an array of [longitude, latitude]',
        });
        return;
      }

      const [lng, lat] = coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Coordinates must be numeric values',
        });
        return;
      }

      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        res.status(400).json({
          success: false,
          message: 'Invalid coordinate values',
        });
        return;
      }
    }
  }

  next();
};

/**
 * Error handling middleware for authentication
 */
export const authErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Auth middleware error:', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message),
    });
    return;
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Mobile number already exists',
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

/**
 * Middleware to check if user profile is complete
 */
export const requireCompleteProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if required fields are present
    if (!user.name || !user.location.city || !user.location.state || !user.location.pincode) {
      res.status(400).json({
        success: false,
        message: 'Profile incomplete. Please complete your profile first.',
        requiresProfileCompletion: true,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Profile completion check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
