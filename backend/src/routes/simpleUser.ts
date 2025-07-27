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
  simpleRateLimit(20, 900000),
  userController.updateProfile.bind(userController)
);

// Update user location
router.post(
  '/location',
  authenticateToken,
  simpleRateLimit(50, 900000),
  userController.updateLocation.bind(userController)
);

export default router;
