'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/services/api';
import { Phone, ArrowLeft, Languages, MessageSquare } from 'lucide-react';

interface LoginFormData {
  mobileNumber: string;
}

export default function LoginPage() {
  const router = useRouter();
  
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format mobile number to include +91 if not present
      let mobileNumber = data.mobileNumber.replace(/\D/g, ''); // Remove all non-digits first
      
      // Ensure it's a 10-digit number and add +91
      if (mobileNumber.length === 10 && /^[6-9]/.test(mobileNumber)) {
        mobileNumber = '+91' + mobileNumber;
      } else {
        throw new Error('Invalid mobile number format');
      }

      console.log('Sending OTP to:', mobileNumber); // Debug log
      console.log('Language:', language); // Debug log
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'); // Debug log
      
      const response = await authApi.sendOTP(mobileNumber, language);
      
      console.log('API Response:', response); // Debug log
      
      if (response.success) {
        setSuccess(language === 'hindi' ? 'OTP भेजा गया!' : 'OTP sent successfully!');
        
        // Redirect to OTP verification page
        setTimeout(() => {
          router.push(`/auth/otp?mobile=${encodeURIComponent(mobileNumber)}&language=${language}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error); // Debug log
      console.error('Error response:', error.response); // Debug log
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      setError(language === 'hindi' ? 'OTP भेजने में त्रुटि हुई' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits max
    if (digits.length > 10) {
      return digits.slice(0, 10);
    }
    
    // Format as per Indian mobile number pattern
    if (digits.length > 5) {
      return digits.replace(/(\d{5})(\d{1,5})/, '$1 $2');
    }
    return digits;
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
              <Phone className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'hindi' ? 'लॉग इन करें' : 'Login to Your Account'}
            </h1>
            <p className="text-gray-600">
              {language === 'hindi' 
                ? 'OTP के साथ तुरंत लॉग इन करें' 
                : 'Quick login with OTP verification'
              }
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={() => setLanguage('hindi')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                language === 'hindi' 
                  ? 'bg-orange-100 text-orange-700 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>हिंदी</span>
            </button>
            <button
              onClick={() => setLanguage('english')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                language === 'english' 
                  ? 'bg-orange-100 text-orange-700 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>English</span>
            </button>
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

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'hindi' ? 'मोबाइल नंबर' : 'Mobile Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">+91</span>
                </div>
                <input
                  {...register('mobileNumber', {
                    required: language === 'hindi' ? 'मोबाइल नंबर आवश्यक है' : 'Mobile number is required',
                    validate: (value) => {
                      // Remove all non-digits for validation
                      const digits = value.replace(/\D/g, '');
                      
                      // Check if it's a valid 10-digit Indian mobile number
                      if (digits.length !== 10) {
                        return language === 'hindi' ? 'मोबाइल नंबर में 10 अंक होने चाहिए' : 'Mobile number must be 10 digits';
                      }
                      
                      // Check if it starts with valid digits (6-9)
                      if (!/^[6-9]/.test(digits)) {
                        return language === 'hindi' ? 'वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid mobile number';
                      }
                      
                      return true;
                    }
                  })}
                  type="tel"
                  placeholder={language === 'hindi' ? '98765 43210' : 'Enter mobile number'}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onChange={(e) => {
                    const formatted = formatMobileNumber(e.target.value);
                    e.target.value = formatted;
                  }}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {language === 'hindi' 
                  ? 'आपको OTP के साथ SMS आएगा' 
                  : 'You will receive an SMS with OTP'
                }
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (() => {
                const mobileValue = watch('mobileNumber');
                if (!mobileValue) return true;
                const digits = mobileValue.replace(/\D/g, '');
                return digits.length !== 10 || !/^[6-9]/.test(digits);
              })()}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'hindi' ? 'OTP भेजा जा रहा है...' : 'Sending OTP...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === 'hindi' ? 'OTP भेजें' : 'Send OTP'}</span>
                </div>
              )}
            </button>
          </form>

          {/* Information */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-orange-600 mt-0.5">
                ℹ️
              </div>
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">
                  {language === 'hindi' ? 'सुरक्षित लॉगिन' : 'Secure Login'}
                </p>
                <p>
                  {language === 'hindi' 
                    ? 'हम आपके मोबाइल नंबर पर एक 6-अंकीय OTP भेजेंगे। यह OTP 10 मिनट के लिए वैध होगा।'
                    : 'We will send a 6-digit OTP to your mobile number. This OTP will be valid for 10 minutes.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {language === 'hindi' 
              ? 'लॉग इन करके, आप स्ट्रीट वेंडर प्लेटफॉर्म की सेवा की शर्तों से सहमत हैं।'
              : 'By logging in, you agree to Street Vendor Platform\'s Terms of Service.'
            }
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm font-medium text-gray-700">
              {language === 'hindi' ? 'सुरक्षित' : 'Secure'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'hindi' ? 'OTP आधारित' : 'OTP Based'}
            </p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm font-medium text-gray-700">
              {language === 'hindi' ? 'तुरंत' : 'Instant'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'hindi' ? 'तेज़ लॉगिन' : 'Quick Login'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
