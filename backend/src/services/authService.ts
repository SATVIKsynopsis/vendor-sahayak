import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/simpleLogger';

export interface ITokenPayload {
  userId: string;
  mobileNumber: string;
  iat?: number;
  exp?: number;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

class JWTService {
  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<ITokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(
        payload,
        config.jwt.secret as string,
        {
          expiresIn: config.jwt.expiresIn,
          issuer: 'street-vendor-api',
          audience: 'street-vendor-app',
        } as jwt.SignOptions
      );
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: Omit<ITokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(
        payload,
        config.jwt.refreshSecret as string,
        {
          expiresIn: config.jwt.refreshExpiresIn,
          issuer: 'street-vendor-api',
          audience: 'street-vendor-app',
        } as jwt.SignOptions
      );
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(payload: Omit<ITokenPayload, 'iat' | 'exp'>): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: 'street-vendor-api',
        audience: 'street-vendor-app',
      }) as ITokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'street-vendor-api',
        audience: 'street-vendor-app',
      }) as ITokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Refresh token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }
}

class OTPService {
  /**
   * Generate random OTP
   */
  generateOTP(length: number = config.otp.length): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  /**
   * Hash OTP for secure storage
   */
  async hashOTP(otp: string): Promise<string> {
    try {
      return await bcrypt.hash(otp, config.security.bcryptRounds);
    } catch (error) {
      logger.error('Error hashing OTP:', error);
      throw new Error('OTP hashing failed');
    }
  }

  /**
   * Verify OTP against hash
   */
  async verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
    try {
      return await bcrypt.compare(otp, hashedOTP);
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      throw new Error('OTP verification failed');
    }
  }

  /**
   * Check if OTP is expired
   */
  isOTPExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Get OTP expiry time
   */
  getOTPExpiryTime(minutes: number = config.otp.expiryMinutes): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}

class PasswordService {
  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.security.bcryptRounds);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Error verifying password:', error);
      throw new Error('Password verification failed');
    }
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    return password;
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export service instances
export const jwtService = new JWTService();
export const otpService = new OTPService();
export const passwordService = new PasswordService();
