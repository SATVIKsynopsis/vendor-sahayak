import { Request, Response } from 'express';
import { User } from '../models/User';
import { OTPVerification } from '../models/OTPVerification';
import { jwtService, otpService } from '../services/authService';
import { simpleSmsService } from '../services/simpleSmsService';
import { logger } from '../utils/simpleLogger';
import { generateOtp, formatMobileNumber, getClientIP, getDeviceInfo, getLanguageFromHeader } from '../utils/helpers';
import { config } from '../config';
import mongoose from 'mongoose';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    mobileNumber: string;
  };
}

export class AuthController {
  /**
   * Send OTP to mobile number
   * POST /api/auth/send-otp
   */
  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { mobileNumber, language = 'hindi' } = req.body;

      // Validate mobile number format
      if (!mobileNumber || !/^\+[1-9]\d{1,14}$/.test(mobileNumber)) {
        res.status(400).json({
          success: false,
          message: 'Invalid mobile number format',
        });
        return;
      }

      // Check rate limiting - prevent too many OTP requests
      const recentOTP = await OTPVerification.findOne({
        mobileNumber,
        createdAt: { $gte: new Date(Date.now() - config.otp.resendCooldownMinutes * 60 * 1000) },
      });

      if (recentOTP && !recentOTP.isVerified) {
        const cooldownRemaining = Math.ceil(
          (config.otp.resendCooldownMinutes * 60 * 1000 - 
           (Date.now() - recentOTP.createdAt.getTime())) / 1000
        );
        
        res.status(429).json({
          success: false,
          message: `Please wait ${cooldownRemaining} seconds before requesting new OTP`,
          cooldownRemaining,
        });
        return;
      }

      // Generate OTP
      const otp = otpService.generateOTP();
      const hashedOTP = await otpService.hashOTP(otp);

      // Get client IP and device info
      const ipAddress = req.ip || req.connection.remoteAddress;
      const deviceInfo = req.get('User-Agent');

      // Store OTP in database
      await OTPVerification.createOTP(
        mobileNumber,
        hashedOTP,
        config.otp.expiryMinutes,
        ipAddress,
        deviceInfo
      );

      // Send OTP via SMS
      const smsResult = await simpleSmsService.sendOTP(mobileNumber, otp, language);

      if (!smsResult.success) {
        logger.error(`Failed to send OTP to ${mobileNumber}:`, smsResult.message);
        res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.',
        });
        return;
      }

      logger.info(`OTP sent successfully to ${mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: config.otp.expiryMinutes * 60, // in seconds
      });

    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Verify OTP and login/register user
   * POST /api/auth/verify-otp
   */
  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { mobileNumber, otp } = req.body;

      // Validate input
      if (!mobileNumber || !otp) {
        res.status(400).json({
          success: false,
          message: 'Mobile number and OTP are required',
        });
        return;
      }

      // Find OTP verification record
      const otpRecord = await OTPVerification.findOne({
        mobileNumber,
        isVerified: false,
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        res.status(400).json({
          success: false,
          message: 'No valid OTP found. Please request a new OTP.',
        });
        return;
      }

      // Check if OTP is expired
      if (otpService.isOTPExpired(otpRecord.expiresAt)) {
        res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new OTP.',
        });
        return;
      }

      // Check attempts limit
      if (otpRecord.attempts >= config.otp.maxAttempts) {
        res.status(400).json({
          success: false,
          message: 'Maximum OTP attempts exceeded. Please request a new OTP.',
        });
        return;
      }

      // Verify OTP
      const isValidOTP = await otpService.verifyOTP(otp, otpRecord.otp);
      
      if (!isValidOTP) {
        // Increment attempts
        await otpRecord.incrementAttempts();
        
        const remainingAttempts = config.otp.maxAttempts - (otpRecord.attempts + 1);
        
        res.status(400).json({
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          remainingAttempts,
        });
        return;
      }

      // Mark OTP as verified
      await otpRecord.markAsVerified();

      // Find or create user
      let user = await User.findOne({ mobileNumber });
      let isNewUser = false;

      if (!user) {
        // This is a new user, they need to complete profile setup
        isNewUser = true;
        
        res.status(200).json({
          success: true,
          message: 'OTP verified successfully',
          isNewUser: true,
          mobileNumber,
          requiresProfileSetup: true,
        });
        return;
      }

      // Update last active
      await user.updateLastActive();

      // Generate tokens
      const tokens = jwtService.generateTokens({
        userId: user._id.toString(),
        mobileNumber: user.mobileNumber,
      });

      logger.info(`User authenticated successfully: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        isNewUser: false,
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          businessType: user.businessType,
          location: user.location,
          preferredLanguage: user.preferredLanguage,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
        },
        tokens,
      });

    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { mobileNumber, language = 'hindi' } = req.body;

      // Use the same logic as sendOTP
      await this.sendOTP(req, res);

    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Complete user profile setup after OTP verification
   * POST /api/auth/complete-profile
   */
  async completeProfile(req: Request, res: Response): Promise<void> {
    try {
      const {
        mobileNumber,
        name,
        businessType,
        location,
        preferredLanguage = 'hindi',
        businessDetails = {},
      } = req.body;

      // Validate required fields
      if (!mobileNumber || !name || !businessType || !location) {
        res.status(400).json({
          success: false,
          message: 'Mobile number, name, business type, and location are required',
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ mobileNumber });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists',
        });
        return;
      }

      // Create new user
      const user = new User({
        mobileNumber,
        name: name.trim(),
        businessType,
        location,
        preferredLanguage,
        businessDetails,
        isVerified: false, // Will be verified through additional steps
      });

      await user.save();

      // Generate tokens
      const tokens = jwtService.generateTokens({
        userId: user._id.toString(),
        mobileNumber: user.mobileNumber,
      });

      logger.info(`New user created: ${user.mobileNumber}`);

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          businessType: user.businessType,
          location: user.location,
          preferredLanguage: user.preferredLanguage,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
        },
        tokens,
      });

    } catch (error) {
      logger.error('Complete profile error:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);

      // Check if user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Generate new tokens
      const tokens = jwtService.generateTokens({
        userId: user._id.toString(),
        mobileNumber: user.mobileNumber,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        tokens,
      });

    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deviceToken } = req.body;
      const userId = req.user?.userId;

      if (userId && deviceToken) {
        // Remove device token from user
        const user = await User.findById(userId);
        if (user) {
          await user.removeDeviceToken(deviceToken);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Update last active
      await user.updateLastActive();

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          businessType: user.businessType,
          location: user.location,
          preferredLanguage: user.preferredLanguage,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          businessDetails: user.businessDetails,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastActive: user.lastActive,
        },
      });

    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const authController = new AuthController();
