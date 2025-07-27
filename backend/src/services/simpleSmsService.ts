import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/simpleLogger';

export interface SMSResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export interface SMSProvider {
  name: string;
  sendOTP: (mobile: string, otp: string, language?: string) => Promise<SMSResponse>;
}

// Mock SMS Service for Development
class MockSMSService implements SMSProvider {
  name = 'Mock SMS Service';

  async sendOTP(mobile: string, otp: string, language: string = 'english'): Promise<SMSResponse> {
    const message = language === 'hindi' 
      ? `आपका OTP कोड है: ${otp}। यह 10 मिनट में समाप्त हो जाएगा। इसे किसी के साथ साझा न करें।`
      : `Your OTP code is: ${otp}. It will expire in 10 minutes. Do not share it with anyone.`;

    logger.info(`📱 SMS Sent to ${mobile}: ${message}`);
    
    return {
      success: true,
      message: 'OTP sent successfully (Mock)',
      messageId: `mock_${Date.now()}`
    };
  }
}

// 2Factor SMS Service (Indian Provider)
class TwoFactorSMSService implements SMSProvider {
  name = '2Factor SMS';

  async sendOTP(mobile: string, otp: string, language: string = 'english'): Promise<SMSResponse> {
    try {
      const apiKey = config.sms.twoFactorApiKey;
      if (!apiKey) {
        throw new Error('2Factor API key not configured');
      }

      // Remove +91 if present
      const cleanMobile = mobile.replace(/^\+91/, '');

      const message = language === 'hindi' 
        ? `आपका OTP: ${otp}। 10 मिनट में समाप्त। साझा न करें।`
        : `Your OTP: ${otp}. Expires in 10 min. Don't share.`;

      const response = await axios.post(`${config.sms.twoFactorApiUrl}/${apiKey}/SMS/${cleanMobile}/${otp}`);

      if (response.data && response.data.Status === 'Success') {
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: response.data.Details
        };
      } else {
        throw new Error(response.data?.Details || 'Failed to send SMS');
      }
    } catch (error: any) {
      logger.error('2Factor SMS Error:', error);
      return {
        success: false,
        message: error.response?.data?.Details || error.message || 'Failed to send SMS'
      };
    }
  }
}

// MSG91 SMS Service
class MSG91SMSService implements SMSProvider {
  name = 'MSG91 SMS';

  async sendOTP(mobile: string, otp: string, language: string = 'english'): Promise<SMSResponse> {
    try {
      const apiKey = config.sms.msg91ApiKey;
      if (!apiKey) {
        throw new Error('MSG91 API key not configured');
      }

      const cleanMobile = mobile.replace(/^\+91/, '');

      const message = language === 'hindi' 
        ? `आपका OTP: ${otp}। 10 मिनट में समाप्त। साझा न करें।`
        : `Your OTP: ${otp}. Expires in 10 min. Don't share.`;

      const response = await axios.post(`${config.sms.msg91ApiUrl}/sendhttp.php`, {
        authkey: apiKey,
        mobiles: cleanMobile,
        message: message,
        sender: 'VENDOR',
        route: 4,
        country: 91
      });

      if (response.data && response.data.type === 'success') {
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: response.data.message
        };
      } else {
        throw new Error(response.data?.message || 'Failed to send SMS');
      }
    } catch (error: any) {
      logger.error('MSG91 SMS Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send SMS'
      };
    }
  }
}

// Fast2SMS Service
class Fast2SMSService implements SMSProvider {
  name = 'Fast2SMS';

  async sendOTP(mobile: string, otp: string, language: string = 'english'): Promise<SMSResponse> {
    try {
      const apiKey = config.sms.fast2smsApiKey;
      if (!apiKey) {
        throw new Error('Fast2SMS API key not configured');
      }

      const cleanMobile = mobile.replace(/^\+91/, '');

      const message = language === 'hindi' 
        ? `आपका OTP: ${otp}। 10 मिनट में समाप्त। साझा न करें।`
        : `Your OTP: ${otp}. Expires in 10 min. Don't share.`;

      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', 
        {
          variables_values: otp,
          route: 'otp',
          numbers: cleanMobile,
          message: message
        },
        {
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.return === true) {
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: response.data.request_id
        };
      } else {
        throw new Error(response.data?.message?.[0] || 'Failed to send SMS');
      }
    } catch (error: any) {
      logger.error('Fast2SMS Error:', error);
      return {
        success: false,
        message: error.response?.data?.message?.[0] || error.message || 'Failed to send SMS'
      };
    }
  }
}

// SMS Service Manager
class SimpleSMSService {
  private providers: SMSProvider[] = [];
  private currentProvider: SMSProvider;

  constructor() {
    // Initialize providers based on configuration
    this.initializeProviders();
    this.currentProvider = this.providers[0] || new MockSMSService();
  }

  private initializeProviders(): void {
    // Add providers based on available configuration
    if (config.sms?.twoFactorApiKey) {
      this.providers.push(new TwoFactorSMSService());
    }
    
    if (config.sms?.msg91ApiKey) {
      this.providers.push(new MSG91SMSService());
    }
    
    if (config.sms?.fast2smsApiKey) {
      this.providers.push(new Fast2SMSService());
    }

    // Always add mock service for development
    if (config.nodeEnv === 'development' || this.providers.length === 0) {
      this.providers.push(new MockSMSService());
    }

    logger.info(`SMS Service initialized with providers: ${this.providers.map(p => p.name).join(', ')}`);
  }

  async sendOTP(mobile: string, otp: string, language: string = 'english'): Promise<SMSResponse> {
    // Try current provider first
    let result = await this.currentProvider.sendOTP(mobile, otp, language);
    
    if (result.success) {
      logger.info(`SMS sent successfully via ${this.currentProvider.name} to ${mobile}`);
      return result;
    }

    // If current provider fails, try others
    for (const provider of this.providers) {
      if (provider === this.currentProvider) continue;
      
      logger.warn(`${this.currentProvider.name} failed, trying ${provider.name}`);
      result = await provider.sendOTP(mobile, otp, language);
      
      if (result.success) {
        this.currentProvider = provider; // Switch to working provider
        logger.info(`SMS sent successfully via ${provider.name} to ${mobile}`);
        return result;
      }
    }

    logger.error(`All SMS providers failed for mobile: ${mobile}`);
    return {
      success: false,
      message: 'All SMS providers failed. Please try again later.'
    };
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  getCurrentProvider(): string {
    return this.currentProvider.name;
  }
}

export const simpleSmsService = new SimpleSMSService();
