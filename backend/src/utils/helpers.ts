import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format and validate mobile number
 * Ensures Indian mobile numbers are properly formatted
 */
export function formatMobileNumber(mobile: string): string {
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.length === 10) {
    // Indian number without country code
    return `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Indian number with country code
    return `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('091')) {
    // International format starting with 0
    return `+${cleaned.substring(1)}`;
  }
  
  // Return as is if already properly formatted
  if (mobile.startsWith('+91') && mobile.length === 13) {
    return mobile;
  }
  
  throw new Error('Invalid mobile number format');
}

/**
 * Validate Indian mobile number
 */
export function isValidIndianMobile(mobile: string): boolean {
  try {
    const formatted = formatMobileNumber(mobile);
    // Indian mobile numbers start with +91 followed by 10 digits
    // First digit after +91 should be 6, 7, 8, or 9
    const regex = /^\+91[6-9]\d{9}$/;
    return regex.test(formatted);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random string
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 */
export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a username from name
 */
export function generateUsername(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
    .substring(0, 10); // Limit length
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleaned}${randomSuffix}`;
}

/**
 * Format date to Indian format
 */
export function formatDateIndian(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: any): string {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
}

/**
 * Extract device info from user agent
 */
export function getDeviceInfo(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  // Simple device detection
  if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
    return 'mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Validate and clean business data
 */
export function validateBusinessName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

export function validateGSTNumber(gst: string): boolean {
  // Basic GST format validation: 15 characters, alphanumeric
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

/**
 * Get language from Accept-Language header
 */
export function getLanguageFromHeader(acceptLanguage: string): string {
  if (!acceptLanguage) return 'english';
  
  const lang = acceptLanguage.toLowerCase();
  if (lang.includes('hi')) return 'hindi';
  if (lang.includes('bn')) return 'bengali';
  if (lang.includes('ta')) return 'tamil';
  if (lang.includes('gu')) return 'gujarati';
  return 'english';
}
