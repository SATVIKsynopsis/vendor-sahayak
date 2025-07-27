import { Router } from 'express';
import { userController } from '../controllers/userController';
import {
  authenticateToken,
  simpleRateLimit,
} from '../middleware/simpleAuth';

const router = Router();

/**
 * User Profile Routes
 * All routes require authentication
 */

// Get user profile
router.get(
  '/profile',
  authenticateToken,
  userController.getProfile.bind(userController)
);

// Update user profile
router.put(
  '/profile',
  authenticateToken,
  authRateLimit,
  validateUserProfile,
  userController.updateProfile.bind(userController)
);

// Update user location
router.post(
  '/location',
  authenticateToken,
  authRateLimit,
  userController.updateLocation.bind(userController)
);

// Update user preferences
router.put(
  '/preferences',
  authenticateToken,
  authRateLimit,
  userController.updatePreferences.bind(userController)
);

// Add device token for push notifications
router.post(
  '/device-token',
  authenticateToken,
  userController.addDeviceToken.bind(userController)
);

// Remove device token
router.delete(
  '/device-token',
  authenticateToken,
  userController.removeDeviceToken.bind(userController)
);

// Get nearby users (requires complete profile)
router.get(
  '/nearby',
  authenticateToken,
  requireCompleteProfile,
  userController.getNearbyUsers.bind(userController)
);

// Delete user account
router.delete(
  '/account',
  authenticateToken,
  authRateLimit,
  userController.deleteAccount.bind(userController)
);

export default router;
