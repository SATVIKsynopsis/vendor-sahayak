import { Request, Response, NextFunction } from 'express';
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
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = jwtService.verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Add user info to request
    req.user = {
      userId: user._id.toString(),
      mobileNumber: user.mobileNumber,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED',
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'INVALID_TOKEN',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if valid token is provided, but doesn't fail if not
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwtService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.user = {
        userId: user._id.toString(),
        mobileNumber: user.mobileNumber,
      };
    }

    next();
  } catch (error: any) {
    logger.error('Optional auth error:', error);
    next(); // Continue without authentication
  }
};

/**
 * Simple rate limiting middleware for authentication endpoints
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const simpleRateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip rate limiting in development
    if (config.nodeEnv === 'development') {
      next();
      return;
    }

    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      // Create new record or reset expired record
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
      return;
    }
    
    record.count++;
    next();
  };
};

/**
 * OTP-specific rate limiting
 */
const otpRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const otpRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // Skip rate limiting in development
  if (config.nodeEnv === 'development') {
    next();
    return;
  }

  const key = req.body.mobileNumber || req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 600000; // 10 minutes
  const maxAttempts = 5;
  
  const record = otpRequestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    // Create new record or reset expired record
    otpRequestCounts.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    next();
    return;
  }
  
  if (record.count >= maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Too many OTP requests, please try again later',
    });
    return;
  }
  
  record.count++;
  next();
};

/**
 * Global error handler for authentication
 */
export const authErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }
  
  next(error);
};
