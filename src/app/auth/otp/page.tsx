'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, MessageSquare, ArrowLeft, RefreshCw } from 'lucide-react';

interface OTPFormData {
  otp: string;
}

function OTPVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<OTPFormData>();

  // Get mobile number from URL params
  useEffect(() => {
    const mobile = searchParams.get('mobile');
    const lang = searchParams.get('language') as 'hindi' | 'english';
    
    if (mobile) {
      setMobileNumber(mobile);
    } else {
      router.push('/');
    }
    
    if (lang) {
      setLanguage(lang);
    }
  }, [searchParams, router]);

  // Handle resend cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const onSubmit = async (data: OTPFormData) => {
    if (!mobileNumber) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.verifyOTP(mobileNumber, data.otp);
      
      if (response.success) {
        setSuccess(language === 'hindi' ? 'OTP सत्यापित! लॉग इन हो रहे हैं...' : 'OTP verified! Logging in...');
        
        // Store auth data and redirect
        login(response.data);
        
        // Check if profile is complete
        if (response.data.user.name && response.data.user.businessType) {
          router.push('/');
        } else {
          router.push(`/auth/profile?mobile=${encodeURIComponent(mobileNumber)}&language=${language}`);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      setError(language === 'hindi' ? 'गलत OTP। कृपया पुनः प्रयास करें।' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!mobileNumber || resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.resendOTP(mobileNumber, language);
      
      if (response.success) {
        setSuccess(language === 'hindi' ? 'OTP पुनः भेजा गया!' : 'OTP resent successfully!');
        setResendCooldown(response.canResendIn || 120); // Default 2 minutes
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      setError(language === 'hindi' ? 'OTP भेजने में त्रुटि हुई' : errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatMobileNumber = (mobile: string) => {
    if (mobile.startsWith('+91')) {
      return mobile.slice(0, 3) + ' ' + mobile.slice(3, 8) + ' ' + mobile.slice(8);
    }
    return mobile;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hindi' ? 'वापस जाएं' : 'Go Back'}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'hindi' ? 'OTP सत्यापन' : 'OTP Verification'}
            </h1>
            <p className="text-gray-600">
              {language === 'hindi' 
                ? 'आपके मोबाइल नंबर पर भेजा गया OTP दर्ज करें' 
                : 'Enter the OTP sent to your mobile number'
              }
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-gray-500">
              <Phone className="w-4 h-4" />
              <span>{formatMobileNumber(mobileNumber)}</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'hindi' ? '6 अंकों का OTP' : '6-Digit OTP'}
              </label>
              <input
                {...register('otp', {
                  required: language === 'hindi' ? 'OTP आवश्यक है' : 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: language === 'hindi' ? 'कृपया 6 अंकों का OTP दर्ज करें' : 'Please enter a 6-digit OTP'
                  }
                })}
                type="text"
                maxLength={6}
                placeholder={language === 'hindi' ? '123456' : 'Enter OTP'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setValue('otp', value);
                }}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || watch('otp')?.length !== 6}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'hindi' ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                </div>
              ) : (
                language === 'hindi' ? 'OTP सत्यापित करें' : 'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {language === 'hindi' ? 'OTP नहीं मिला?' : "Didn't receive OTP?"}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
              className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0 
                  ? `${language === 'hindi' ? 'पुनः भेजें' : 'Resend in'} ${resendCooldown}s`
                  : language === 'hindi' ? 'OTP पुनः भेजें' : 'Resend OTP'
                }
              </span>
            </button>
          </div>

          {/* Language Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setLanguage('hindi')}
                className={`px-3 py-1 rounded-full text-sm ${
                  language === 'hindi' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('english')}
                className={`px-3 py-1 rounded-full text-sm ${
                  language === 'english' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function OTPLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<OTPLoadingFallback />}>
      <OTPVerificationContent />
    </Suspense>
  );
}
