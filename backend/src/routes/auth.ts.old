import { Router } from 'express';
import { authController } from '../controllers/authController';
import {
  simpleRateLimit,
  otpRateLimit,
  authenticateToken,
} from '../middleware/simpleAuth';

const router = Router();

/**
 * Authentication Routes
 */

// Send OTP
router.post(
  '/send-otp',
  otpRateLimit,
  validateMobileNumber,
  authController.sendOTP.bind(authController)
);

// Verify OTP
router.post(
  '/verify-otp',
  authRateLimit,
  validateMobileNumber,
  validateOTP,
  authController.verifyOTP.bind(authController)
);

// Resend OTP
router.post(
  '/resend-otp',
  otpRateLimit,
  validateMobileNumber,
  authController.resendOTP.bind(authController)
);

// Complete profile after OTP verification
router.post(
  '/complete-profile',
  authRateLimit,
  validateMobileNumber,
  validateUserProfile,
  authController.completeProfile.bind(authController)
);

// Refresh token
router.post(
  '/refresh-token',
  authRateLimit,
  authController.refreshToken.bind(authController)
);

// Logout
router.post(
  '/logout',
  authenticateToken,
  authController.logout.bind(authController)
);

// Get current user
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser.bind(authController)
);

export default router;
