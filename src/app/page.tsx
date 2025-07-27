'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Filters from '@/components/Filters';
import SupplierCard from '@/components/SupplierCard';
import Chatbot from '@/components/Chatbot';
import ApiKeySetup from '@/components/ApiKeySetup';
import { FilterOptions } from '@/types';
import { mockSuppliers } from '@/data/suppliers';
import { Package, ShieldCheck, Users, TrendingUp, Languages, Globe } from 'lucide-react';

export default function Home() { 
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All Categories',
    location: 'All States',
    certification: 'All Certifications',
    priceRange: 'All Ranges',
    rating: 0,
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isApiSetupOpen, setIsApiSetupOpen] = useState(false);
  const [isHindi, setIsHindi] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return mockSuppliers.filter((supplier) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          supplier.name.toLowerCase().includes(query) ||
          supplier.category.toLowerCase().includes(query) ||
          supplier.products.some(product => product.toLowerCase().includes(query)) ||
          supplier.location.city.toLowerCase().includes(query) ||
          supplier.location.state.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== 'All Categories' && supplier.category !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location !== 'All States' && supplier.location.state !== filters.location) {
        return false;
      }

      // Certification filter
      if (filters.certification !== 'All Certifications') {
        switch (filters.certification) {
          case 'BIS Certified':
            if (!supplier.certifications.bis) return false;
            break;
          case 'ISO Certified':
            if (!supplier.certifications.iso) return false;
            break;
          case 'MSME Registered':
            if (!supplier.certifications.msme) return false;
            break;
        }
      }

      // Price range filter
      if (filters.priceRange !== 'All Ranges' && supplier.priceRange !== filters.priceRange) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && supplier.rating < filters.rating) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const stats = {
    totalSuppliers: mockSuppliers.length,
    verifiedSuppliers: mockSuppliers.filter(s => s.verified).length,
    categories: new Set(mockSuppliers.map(s => s.category)).size,
    avgRating: (mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.15'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3Ccircle cx='73' cy='7' r='2'/%3E%3Ccircle cx='7' cy='73' r='2'/%3E%3Ccircle cx='73' cy='73' r='2'/%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-orange-300/20 to-yellow-300/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-green-300/20 to-emerald-300/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-300/15 to-indigo-300/15 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-gradient-to-r from-purple-300/15 to-pink-300/15 rounded-full blur-xl animate-pulse animation-delay-3000"></div>
      
      {/* Language Toggle - Mobile Optimized */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-40">
        <button
          onClick={() => setIsHindi(!isHindi)}
          className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-sm border border-orange-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-orange-700 hover:bg-orange-50"
        >
          <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium">
            {isHindi ? 'English' : 'हिंदी'}
          </span>
          <Globe className="h-2 w-2 sm:h-3 sm:w-3" />
        </button>
      </div>
      
      <Header 
        onSearchChange={setSearchQuery}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
      />

      <main className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile-First Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Catchy Hindi/English Header */}
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full border border-orange-200 mb-3 sm:mb-4">
              <span className="text-orange-800 font-semibold text-xs sm:text-sm">
                {isHindi ? '🛒 विश्वसनीय आपूर्तिकर्ता खोजें' : '🛒 Find Trusted Suppliers'}
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight px-2">
            {isHindi ? (
              <>
                प्रमाणित आपूर्तिकर्ताओं के साथ<br />
                <span className="text-xl sm:text-3xl lg:text-4xl">अपना व्यापार बढ़ाएं</span>
              </>
            ) : (
              <>
                Find Verified Suppliers<br />
                <span className="text-xl sm:text-3xl lg:text-4xl">Grow Your Business</span>
              </>
            )}
          </h1>
          
          <p className="text-sm sm:text-lg text-gray-700 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            {isHindi ? (
              <>
                BIS, ISO और MSME प्रमाणित आपूर्तिकर्ताओं से जुड़ें। गुणवत्तापूर्ण सामग्री प्राप्त करें और अपने व्यापार को आत्मविश्वास के साथ आगे बढ़ाएं।
                <br />
                <span className="text-orange-600 font-semibold text-xs sm:text-base">"सफलता का रास्ता, सही आपूर्तिकर्ता के साथ!"</span>
              </>
            ) : (
              <>
                Connect with certified suppliers who meet BIS, ISO, and MSME standards. 
                Get quality materials and grow your street vendor business with confidence.
                <br />
                <span className="text-orange-600 font-semibold text-xs sm:text-base">"Your Success, Our Suppliers!"</span>
              </>
            )}
          </p>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-3 shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSuppliers}</div>
              <div className="text-sm text-gray-600 font-medium">
                {isHindi ? 'कुल आपूर्तिकर्ता' : 'Total Suppliers'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mx-auto mb-3 shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.verifiedSuppliers}</div>
              <div className="text-sm text-gray-600 font-medium">
                {isHindi ? 'सत्यापित' : 'Verified'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mx-auto mb-3 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.categories}</div>
              <div className="text-sm text-gray-600 font-medium">
                {isHindi ? 'श्रेणियां' : 'Categories'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/90 to-yellow-50/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgRating}</div>
              <div className="text-sm text-gray-600 font-medium">
                {isHindi ? 'औसत रेटिंग' : 'Avg Rating'}
              </div>
            </div>
          </div>
          
          {/* Hindi Motivational Quote */}
          <div className="bg-gradient-to-r from-orange-100 via-yellow-100 to-red-100 rounded-2xl p-6 border border-orange-200 shadow-lg max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {isHindi ? (
                '"सही आपूर्तिकर्ता के साथ, हर सपना हो सकता है साकार!"'
              ) : (
                '"With the right supplier, every dream can come true!"'
              )}
            </p>
            <p className="text-sm text-gray-600">
              {isHindi ? '- भारतीय स्ट्रीट वेंडर समुदाय' : '- Indian Street Vendor Community'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Filters filters={filters} onFilterChange={setFilters} />

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isHindi ? (
                <>
                  {filteredSuppliers.length} आपूर्तिकर्ता मिले
                  {searchQuery && (
                    <span className="text-gray-600 font-normal ml-2">
                      &ldquo;{searchQuery}&rdquo; के लिए
                    </span>
                  )}
                </>
              ) : (
                <>
                  {filteredSuppliers.length} Suppliers Found
                  {searchQuery && (
                    <span className="text-gray-600 font-normal ml-2">
                      for &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Supplier Grid */}
        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package className="h-16 w-16 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isHindi ? 'कोई आपूर्तिकर्ता नहीं मिला' : 'No suppliers found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isHindi ? 
                'अधिक आपूर्तिकर्ता खोजने के लिए अपनी खोज या फ़िल्टर बदलने का प्रयास करें।' :
                'Try adjusting your search terms or filters to find more suppliers.'
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  category: 'All Categories',
                  location: 'All States',
                  certification: 'All Certifications',
                  priceRange: 'All Ranges',
                  rating: 0,
                });
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Clear All Filters'}
            </button>
          </div>
        )}

        {/* Enhanced Help Section */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 via-yellow-50 to-red-50 rounded-2xl p-8 border border-orange-200 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-semibold text-sm mb-4 shadow-lg">
              <span>🤖 AI सहायक</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {isHindi ? 
                'सही आपूर्तिकर्ता खोजने में मदद चाहिए?' : 
                'Need Help Finding the Right Supplier?'
              }
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
              {isHindi ? (
                <>
                  हमारा AI सहायक आपको प्रमाणन आवश्यकताओं, गुणवत्ता मानकों को समझने में मदद कर सकता है, 
                  और आपकी व्यापारिक आवश्यकताओं के लिए सही आपूर्तिकर्ताओं का मार्गदर्शन कर सकता है।
                  <br />
                  <span className="text-orange-600 font-semibold mt-2 block">
                    "आपकी सफलता, हमारी जिम्मेदारी!"
                  </span>
                </>
              ) : (
                <>
                  Our AI assistant can help you understand certification requirements, 
                  quality standards, and guide you to the right suppliers for your business needs.
                  <br />
                  <span className="text-orange-600 font-semibold mt-2 block">
                    "Your Success is Our Responsibility!"
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {isHindi ? '🤖 AI सहायक से पूछें' : '🤖 Ask AI Assistant'}
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {isHindi ? 'उपलब्ध भाषाएं:' : 'Available Languages:'}
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">हिंदी</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">English</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">বাংলা</span>
              </div>
            </div>
          </div>
          
          {/* Popular Questions */}
          <div className="mt-8 pt-6 border-t border-orange-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {isHindi ? '🔥 लोकप्रिय प्रश्न' : '🔥 Popular Questions'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-3 bg-white/80 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors text-sm text-left"
              >
                {isHindi ? 'BIS प्रमाणन क्या है?' : 'What is BIS certification?'}
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-3 bg-white/80 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors text-sm text-left"
              >
                {isHindi ? 'कैसे करें मोलभाव?' : 'How to negotiate prices?'}
              </button>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-3 bg-white/80 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors text-sm text-left"
              >
                {isHindi ? 'MSME रजिस्ट्रेशन की जानकारी' : 'MSME registration info'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* API Key Setup */}
      <ApiKeySetup isOpen={isApiSetupOpen} onClose={() => setIsApiSetupOpen(false)} />
    </div>
  );
}
