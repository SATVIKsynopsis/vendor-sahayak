import axios, { AxiosResponse } from 'axios';

// API Base URL - Update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface User {
  _id: string;
  mobileNumber: string;
  name: string;
  businessType: 'street_vendor' | 'small_shop' | 'retailer' | 'wholesaler';
  location: {
    city: string;
    state: string;
    pincode: string;
    area?: string;
    coordinates: [number, number];
  };
  preferredLanguage: 'hindi' | 'english' | 'bengali' | 'tamil' | 'gujarati';
  isVerified: boolean;
  profilePicture?: string;
  businessDetails: {
    shopName?: string;
    gstNumber?: string;
    establishedYear?: number;
    employeeCount?: number;
  };
  preferences: {
    notifications: {
      sms: boolean;
      email: boolean;
      push: boolean;
    };
    categories: string[];
    priceAlerts: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  canResendIn?: number;
}

// Authentication API calls
export const authApi = {
  // Send OTP to mobile number
  sendOTP: async (mobileNumber: string, language: 'hindi' | 'english' = 'hindi'): Promise<OTPResponse> => {
    const response: AxiosResponse<OTPResponse> = await apiClient.post('/auth/send-otp', {
      mobileNumber,
      language,
    });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (mobileNumber: string, otp: string): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/verify-otp', {
      mobileNumber,
      otp,
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (mobileNumber: string, language: 'hindi' | 'english' = 'hindi'): Promise<OTPResponse> => {
    const response: AxiosResponse<OTPResponse> = await apiClient.post('/auth/resend-otp', {
      mobileNumber,
      language,
    });
    return response.data;
  },

  // Complete profile setup
  completeProfile: async (profileData: {
    mobileNumber: string;
    name: string;
    businessType: string;
    location: {
      city: string;
      state: string;
      pincode: string;
      area?: string;
      coordinates: [number, number];
    };
    preferredLanguage?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post('/auth/complete-profile', profileData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response: AxiosResponse<ApiResponse<{ accessToken: string }>> = await apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await apiClient.post('/auth/logout');
    return response.data;
  },
};

// User API calls
export const userApi = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  // Update user location
  updateLocation: async (location: {
    city: string;
    state: string;
    pincode: string;
    area?: string;
    coordinates: [number, number];
  }): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/user/location', location);
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences: User['preferences']): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/user/preferences', preferences);
    return response.data;
  },

  // Add device token for push notifications
  addDeviceToken: async (token: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await apiClient.post('/user/device-token', { token });
    return response.data;
  },

  // Remove device token
  removeDeviceToken: async (token: string): Promise<ApiResponse<null>> => {
    const response: AxiosResponse<ApiResponse<null>> = await apiClient.delete('/user/device-token', { data: { token } });
    return response.data;
  },

  // Get nearby users
  getNearbyUsers: async (radius: number = 5000): Promise<ApiResponse<User[]>> => {
    const response: AxiosResponse<ApiResponse<User[]>> = await apiClient.get(`/user/nearby?radius=${radius}`);
    return response.data;
  },
};

// Utility functions
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuthData = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const storeAuthData = (authResponse: AuthResponse): void => {
  localStorage.setItem('accessToken', authResponse.accessToken);
  localStorage.setItem('refreshToken', authResponse.refreshToken);
  localStorage.setItem('user', JSON.stringify(authResponse.user));
};

export default apiClient;
