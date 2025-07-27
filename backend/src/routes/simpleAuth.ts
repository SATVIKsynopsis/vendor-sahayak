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
  authController.sendOTP.bind(authController)
);

// Verify OTP
router.post(
  '/verify-otp',
  simpleRateLimit(50, 900000), // 50 requests per 15 minutes
  authController.verifyOTP.bind(authController)
);

// Resend OTP
router.post(
  '/resend-otp',
  otpRateLimit,
  authController.resendOTP.bind(authController)
);

// Complete Profile
router.post(
  '/complete-profile',
  simpleRateLimit(20, 900000),
  authController.completeProfile.bind(authController)
);

// Refresh Token
router.post(
  '/refresh-token',
  simpleRateLimit(10, 900000),
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
