'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, Store, ArrowLeft, Languages } from 'lucide-react';

interface ProfileFormData {
  name: string;
  businessType: 'street_vendor' | 'small_shop' | 'retailer' | 'wholesaler';
  city: string;
  state: string;
  pincode: string;
  area?: string;
  preferredLanguage: 'hindi' | 'english' | 'bengali' | 'tamil' | 'gujarati';
}

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileFormData>({
    defaultValues: {
      preferredLanguage: 'hindi',
      businessType: 'street_vendor'
    }
  });

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
      setValue('preferredLanguage', lang);
    }
  }, [searchParams, router, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!mobileNumber) return;
    
    setLoading(true);
    setError('');

    try {
      // Get coordinates for the location (you can integrate with a geocoding service)
      const coordinates: [number, number] = [77.2300, 28.6562]; // Default Delhi coordinates

      const profileData = {
        mobileNumber,
        name: data.name,
        businessType: data.businessType,
        location: {
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          area: data.area,
          coordinates
        },
        preferredLanguage: data.preferredLanguage
      };

      const response = await authApi.completeProfile(profileData);
      
      if (response.success) {
        // Store auth data and redirect to home
        login(response.data);
        router.push('/');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile setup failed';
      setError(language === 'hindi' ? 'प्रोफ़ाइल सेटअप में त्रुटि हुई' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    { value: 'street_vendor', label: language === 'hindi' ? 'स्ट्रीट वेंडर' : 'Street Vendor', icon: '🛒' },
    { value: 'small_shop', label: language === 'hindi' ? 'छोटी दुकान' : 'Small Shop', icon: '🏪' },
    { value: 'retailer', label: language === 'hindi' ? 'रिटेलर' : 'Retailer', icon: '🏬' },
    { value: 'wholesaler', label: language === 'hindi' ? 'होलसेलर' : 'Wholesaler', icon: '🏭' }
  ];

  const languages = [
    { value: 'hindi', label: 'हिंदी' },
    { value: 'english', label: 'English' },
    { value: 'bengali', label: 'বাংলা' },
    { value: 'tamil', label: 'தமிழ்' },
    { value: 'gujarati', label: 'ગુજરાતી' }
  ];

  const indianStates = [
    'Delhi', 'Maharashtra', 'Karnataka', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
    'Uttar Pradesh', 'Madhya Pradesh', 'West Bengal', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh',
    'Telangana', 'Odisha', 'Bihar', 'Jharkhand', 'Assam', 'Uttarakhand', 'Himachal Pradesh'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
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
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'hindi' ? 'प्रोफ़ाइल सेटअप' : 'Profile Setup'}
            </h1>
            <p className="text-gray-600">
              {language === 'hindi' 
                ? 'अपनी बिजनेस जानकारी पूरी करें' 
                : 'Complete your business information'
              }
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <>
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'hindi' ? 'आपका नाम' : 'Your Name'}
                  </label>
                  <input
                    {...register('name', {
                      required: language === 'hindi' ? 'नाम आवश्यक है' : 'Name is required',
                      minLength: {
                        value: 2,
                        message: language === 'hindi' ? 'नाम कम से कम 2 अक्षर का होना चाहिए' : 'Name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    placeholder={language === 'hindi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {language === 'hindi' ? 'व्यवसाय का प्रकार' : 'Business Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {businessTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          watch('businessType') === type.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          {...register('businessType', {
                            required: language === 'hindi' ? 'व्यवसाय का प्रकार चुनें' : 'Please select business type'
                          })}
                          type="radio"
                          value={type.value}
                          className="sr-only"
                        />
                        <span className="text-2xl mr-3">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.businessType && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                  )}
                </div>

                {/* Language Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'hindi' ? 'पसंदीदा भाषा' : 'Preferred Language'}
                  </label>
                  <select
                    {...register('preferredLanguage')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!watch('name') || !watch('businessType')}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {language === 'hindi' ? 'आगे बढ़ें' : 'Continue'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hindi' ? 'शहर' : 'City'}
                    </label>
                    <input
                      {...register('city', {
                        required: language === 'hindi' ? 'शहर आवश्यक है' : 'City is required'
                      })}
                      type="text"
                      placeholder={language === 'hindi' ? 'शहर का नाम' : 'City name'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hindi' ? 'राज्य' : 'State'}
                    </label>
                    <select
                      {...register('state', {
                        required: language === 'hindi' ? 'राज्य चुनें' : 'Please select state'
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">
                        {language === 'hindi' ? 'राज्य चुनें' : 'Select State'}
                      </option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hindi' ? 'पिनकोड' : 'Pincode'}
                    </label>
                    <input
                      {...register('pincode', {
                        required: language === 'hindi' ? 'पिनकोड आवश्यक है' : 'Pincode is required',
                        pattern: {
                          value: /^[1-9][0-9]{5}$/,
                          message: language === 'hindi' ? 'वैध पिनकोड दर्ज करें' : 'Enter valid pincode'
                        }
                      })}
                      type="text"
                      maxLength={6}
                      placeholder={language === 'hindi' ? '110001' : 'Enter pincode'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'hindi' ? 'क्षेत्र (वैकल्पिक)' : 'Area (Optional)'}
                    </label>
                    <input
                      {...register('area')}
                      type="text"
                      placeholder={language === 'hindi' ? 'आपका क्षेत्र' : 'Your area'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    {language === 'hindi' ? 'पीछे जाएं' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{language === 'hindi' ? 'सेव हो रहा है...' : 'Saving...'}</span>
                      </div>
                    ) : (
                      language === 'hindi' ? 'प्रोफ़ाइल पूरी करें' : 'Complete Profile'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ProfileLoadingFallback() {
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

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<ProfileLoadingFallback />}>
      <ProfileSetupContent />
    </Suspense>
  );
}
