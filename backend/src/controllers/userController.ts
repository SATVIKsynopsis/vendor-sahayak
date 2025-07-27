import { Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from './authController';
import { logger } from '../utils/simpleLogger';
import mongoose from 'mongoose';

export class UserController {
  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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
          fullAddress: user.fullAddress,
          preferredLanguage: user.preferredLanguage,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          businessDetails: user.businessDetails,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastActive: user.lastActive,
          deviceTokens: user.deviceTokens.length, // Only count, not actual tokens
        },
      });

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const {
        name,
        businessType,
        location,
        preferredLanguage,
        businessDetails,
        preferences,
      } = req.body;

      // Update allowed fields
      if (name !== undefined) {
        user.name = name.trim();
      }
      
      if (businessType !== undefined) {
        user.businessType = businessType;
      }
      
      if (location !== undefined) {
        user.location = location;
      }
      
      if (preferredLanguage !== undefined) {
        user.preferredLanguage = preferredLanguage;
      }
      
      if (businessDetails !== undefined) {
        user.businessDetails = { ...user.businessDetails, ...businessDetails };
      }
      
      if (preferences !== undefined) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      // Update last active
      await user.updateLastActive();
      
      // Save changes
      await user.save();

      logger.info(`User profile updated: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          businessType: user.businessType,
          location: user.location,
          fullAddress: user.fullAddress,
          preferredLanguage: user.preferredLanguage,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          businessDetails: user.businessDetails,
          preferences: user.preferences,
          updatedAt: user.updatedAt,
        },
      });

    } catch (error) {
      logger.error('Update profile error:', error);
      
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
   * Update user location
   * POST /api/user/location
   */
  async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { location } = req.body;

      if (!location) {
        res.status(400).json({
          success: false,
          message: 'Location data is required',
        });
        return;
      }

      // Validate coordinates if provided
      if (location.coordinates) {
        const [lng, lat] = location.coordinates;
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          res.status(400).json({
            success: false,
            message: 'Invalid coordinates',
          });
          return;
        }
      }

      // Update location
      user.location = { ...user.location, ...location };
      await user.updateLastActive();
      await user.save();

      logger.info(`User location updated: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        location: user.location,
        fullAddress: user.fullAddress,
      });

    } catch (error) {
      logger.error('Update location error:', error);
      
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
   * Update user preferences
   * PUT /api/user/preferences
   */
  async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { preferences } = req.body;

      if (!preferences) {
        res.status(400).json({
          success: false,
          message: 'Preferences data is required',
        });
        return;
      }

      // Update preferences
      user.preferences = { ...user.preferences, ...preferences };
      await user.updateLastActive();
      await user.save();

      logger.info(`User preferences updated: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: user.preferences,
      });

    } catch (error) {
      logger.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add device token for push notifications
   * POST /api/user/device-token
   */
  async addDeviceToken(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { deviceToken } = req.body;

      if (!deviceToken) {
        res.status(400).json({
          success: false,
          message: 'Device token is required',
        });
        return;
      }

      // Add device token
      await user.addDeviceToken(deviceToken);
      await user.updateLastActive();

      logger.info(`Device token added for user: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Device token added successfully',
      });

    } catch (error) {
      logger.error('Add device token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Remove device token
   * DELETE /api/user/device-token
   */
  async removeDeviceToken(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { deviceToken } = req.body;

      if (!deviceToken) {
        res.status(400).json({
          success: false,
          message: 'Device token is required',
        });
        return;
      }

      // Remove device token
      await user.removeDeviceToken(deviceToken);
      await user.updateLastActive();

      logger.info(`Device token removed for user: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Device token removed successfully',
      });

    } catch (error) {
      logger.error('Remove device token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get users by location (nearby users)
   * GET /api/user/nearby
   */
  async getNearbyUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { longitude, latitude, radius = 5000 } = req.query;

      if (!longitude || !latitude) {
        res.status(400).json({
          success: false,
          message: 'Longitude and latitude are required',
        });
        return;
      }

      const lng = parseFloat(longitude as string);
      const lat = parseFloat(latitude as string);
      const radiusInMeters = parseInt(radius as string, 10);

      // Find nearby users using geospatial query
      const nearbyUsers = await User.find({
        _id: { $ne: userId }, // Exclude current user
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusInMeters,
          },
        },
      })
      .select('name businessType location isVerified profilePicture')
      .limit(50);

      res.status(200).json({
        success: true,
        message: 'Nearby users retrieved successfully',
        users: nearbyUsers.map(user => ({
          id: user._id,
          name: user.name,
          businessType: user.businessType,
          location: {
            city: user.location.city,
            state: user.location.state,
            area: user.location.area,
          },
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          distance: 'calculated', // TODO: Calculate actual distance
        })),
        count: nearbyUsers.length,
      });

    } catch (error) {
      logger.error('Get nearby users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete user account
   * DELETE /api/user/account
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // TODO: Add confirmation mechanism (like OTP) for account deletion
      // TODO: Clean up related data (chats, favorites, etc.)

      await User.findByIdAndDelete(userId);

      logger.info(`User account deleted: ${user.mobileNumber}`);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });

    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export const userController = new UserController();
