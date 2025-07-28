'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Shield, 
  Award, 
  CheckCircle,
  Package,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  MessageSquare,
  Share2,
  Heart,
  ExternalLink,
  Building,
  Target,
  Truck,
  IndianRupee
} from 'lucide-react';
import { Supplier } from '@/types';
import { mockSuppliers } from '@/data/suppliers';

// Mock data for recent vendors who purchased from this supplier
interface RecentVendor {
  id: string;
  name: string;
  businessType: string;
  location: string;
  purchaseDate: string;
  products: string[];
  amount: number;
  rating: number;
}

interface SupplierStats {
  totalOrders: number;
  activeVendors: number;
  avgDeliveryTime: number;
  satisfactionRate: number;
  monthlyGrowth: number;
}

interface ProductReview {
  id: string;
  vendorName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  product: string;
}

const generateMockRecentVendors = (supplierId: string): RecentVendor[] => [
  {
    id: '1',
    name: 'राज कुमार (Street Vendor)',
    businessType: 'Street Vendor',
    location: 'Connaught Place, Delhi',
    purchaseDate: '2025-07-25',
    products: ['Cotton Fabric', 'Polyester Blend'],
    amount: 15000,
    rating: 4.5
  },
  {
    id: '2',
    name: 'सुनीता देवी (Small Shop)',
    businessType: 'Small Shop',
    location: 'Karol Bagh, Delhi',
    purchaseDate: '2025-07-24',
    products: ['Silk Fabric'],
    amount: 8500,
    rating: 5.0
  },
  {
    id: '3',
    name: 'अमित शर्मा (Retailer)',
    businessType: 'Retailer',
    location: 'Lajpat Nagar, Delhi',
    purchaseDate: '2025-07-23',
    products: ['Cotton Fabric', 'Silk Fabric', 'Polyester Blend'],
    amount: 25000,
    rating: 4.2
  },
  {
    id: '4',
    name: 'प्रिया गुप्ता (Street Vendor)',
    businessType: 'Street Vendor',
    location: 'Chandni Chowk, Delhi',
    purchaseDate: '2025-07-22',
    products: ['Cotton Fabric'],
    amount: 6000,
    rating: 4.8
  },
  {
    id: '5',
    name: 'मोहन लाल (Wholesaler)',
    businessType: 'Wholesaler',
    location: 'Sadar Bazaar, Delhi',
    purchaseDate: '2025-07-21',
    products: ['Polyester Blend'],
    amount: 45000,
    rating: 4.0
  }
];

const generateMockStats = (supplierId: string): SupplierStats => ({
  totalOrders: 1247,
  activeVendors: 89,
  avgDeliveryTime: 3,
  satisfactionRate: 92,
  monthlyGrowth: 15
});

const generateMockReviews = (supplierId: string): ProductReview[] => [
  {
    id: '1',
    vendorName: 'राज कुमार',
    rating: 5,
    comment: 'बहुत अच्छी क्वालिटी का कपड़ा मिलता है। डिलीवरी भी समय पर होती है।',
    date: '2025-07-20',
    verified: true,
    product: 'Cotton Fabric'
  },
  {
    id: '2',
    vendorName: 'सुनीता देवी',
    rating: 4,
    comment: 'Good quality products. Price is reasonable for street vendors.',
    date: '2025-07-18',
    verified: true,
    product: 'Silk Fabric'
  },
  {
    id: '3',
    vendorName: 'अमित शर्मा',
    rating: 5,
    comment: 'Excellent service and quality. Highly recommended for bulk orders.',
    date: '2025-07-15',
    verified: true,
    product: 'Polyester Blend'
  }
];

export default function SupplierDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'reviews'>('overview');
  const [language, setLanguage] = useState<'hindi' | 'english'>('english');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const supplierId = params.id as string;
    const foundSupplier = mockSuppliers.find(s => s.id === supplierId);
    
    if (foundSupplier) {
      setSupplier(foundSupplier);
      setRecentVendors(generateMockRecentVendors(supplierId));
      setStats(generateMockStats(supplierId));
      setReviews(generateMockReviews(supplierId));
    }
  }, [params.id]);

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  const getCertificationBadges = () => {
    const badges = [];
    if (supplier.certifications.bis) {
      badges.push(
        <span key="bis" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Shield className="h-4 w-4 mr-1" />
          BIS Certified
        </span>
      );
    }
    if (supplier.certifications.iso) {
      badges.push(
        <span key="iso" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <Award className="h-4 w-4 mr-1" />
          ISO Certified
        </span>
      );
    }
    if (supplier.certifications.msme) {
      badges.push(
        <span key="msme" className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          <Building className="h-4 w-4 mr-1" />
          MSME Registered
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'hindi' ? 'वापस जाएं' : 'Back to Home'}
                </span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('hindi')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    language === 'hindi' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage('english')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    language === 'english' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supplier Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Supplier Image */}
            <div className="flex-shrink-0 mb-6 lg:mb-0">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                <Package className="w-16 h-16 text-orange-600" />
              </div>
            </div>

            {/* Supplier Info */}
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{supplier.name}</h1>
                  <p className="text-lg text-gray-600 mb-3">{supplier.category}</p>
                  
                  <div className="flex items-center space-x-1 mb-4">
                    {renderStars(supplier.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {supplier.rating} ({supplier.totalReviews} {language === 'hindi' ? 'समीक्षाएं' : 'reviews'})
                    </span>
                  </div>
                </div>

                {supplier.verified && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'hindi' ? 'सत्यापित' : 'Verified'}
                    </span>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-2 mb-6">
                {getCertificationBadges()}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'hindi' ? 'स्थान' : 'Location'}</p>
                    <p className="font-medium  text-gray-600">{supplier.location.city}, {supplier.location.state}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'hindi' ? 'फोन' : 'Phone'}</p>
                    <p className="font-medium  text-gray-600">{supplier.contactInfo.phone}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'hindi' ? 'उत्पाद' : 'Products'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.products.map((product, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'hindi' ? 'कुल ऑर्डर' : 'Total Orders'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'hindi' ? 'सक्रिय विक्रेता' : 'Active Vendors'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeVendors}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'hindi' ? 'डिलीवरी समय' : 'Avg Delivery'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime} {language === 'hindi' ? 'दिन' : 'days'}</p>
                </div>
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'hindi' ? 'संतुष्टि दर' : 'Satisfaction'}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{language === 'hindi' ? 'मासिक वृद्धि' : 'Monthly Growth'}</p>
                  <p className="text-2xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-6">
              {[
                { id: 'overview', label: language === 'hindi' ? 'अवलोकन' : 'Overview' },
                { id: 'vendors', label: language === 'hindi' ? 'हाल के विक्रेता' : 'Recent Vendors' },
                { id: 'reviews', label: language === 'hindi' ? 'समीक्षाएं' : 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {language === 'hindi' ? 'प्रमाणन विवरण' : 'Certification Details'}
                  </h3>
                  <div className="space-y-3">
                    {supplier.certifications.details.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {language === 'hindi' ? 'संपर्क जानकारी' : 'Contact Information'}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{language === 'hindi' ? 'पता' : 'Address'}</p>
                        <p className="font-medium">{supplier.contactInfo.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{language === 'hindi' ? 'मूल्य श्रेणी' : 'Price Range'}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          supplier.priceRange === 'Low' ? 'bg-green-100 text-green-800' :
                          supplier.priceRange === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {supplier.priceRange === 'Low' ? (language === 'hindi' ? 'कम' : 'Low') :
                           supplier.priceRange === 'Medium' ? (language === 'hindi' ? 'मध्यम' : 'Medium') :
                           (language === 'hindi' ? 'उच्च' : 'High')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Vendors Tab */}
            {activeTab === 'vendors' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {language === 'hindi' ? 'हाल ही में खरीदारी करने वाले विक्रेता' : 'Recent Vendor Purchases'}
                </h3>
                <div className="space-y-4">
                  {recentVendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900 mb-1">{vendor.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{vendor.businessType} • {vendor.location}</p>
                          <div className="flex items-center space-x-1">
                            {renderStars(vendor.rating)}
                            <span className="text-sm text-gray-600 ml-2">{vendor.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{language === 'hindi' ? 'खरीदारी की तारीख' : 'Purchase Date'}</p>
                          <p className="font-medium">{new Date(vendor.purchaseDate).toLocaleDateString()}</p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            ₹{vendor.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{language === 'hindi' ? 'खरीदे गए उत्पाद:' : 'Products Purchased:'}</p>
                        <div className="flex flex-wrap gap-2">
                          {vendor.products.map((product, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {language === 'hindi' ? 'ग्राहक समीक्षाएं' : 'Customer Reviews'}
                </h3>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">
                              {review.vendorName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.vendorName}</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              {review.verified && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {language === 'hindi' ? 'सत्यापित खरीदार' : 'Verified Purchase'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {language === 'hindi' ? 'उत्पाद:' : 'Product:'} {review.product}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">
                {language === 'hindi' ? 'इस आपूर्तिकर्ता से संपर्क करें' : 'Contact This Supplier'}
              </h3>
              <p className="text-orange-100">
                {language === 'hindi' 
                  ? 'अपने व्यावसायिक आवश्यकताओं के लिए आज ही संपर्क करें'
                  : 'Get in touch today for your business requirements'
                }
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href={`tel:${supplier.contactInfo.phone}`}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>{language === 'hindi' ? 'कॉल करें' : 'Call Now'}</span>
              </a>
              {supplier.contactInfo.email && (
                <a
                  href={`mailto:${supplier.contactInfo.email}`}
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>{language === 'hindi' ? 'ईमेल भेजें' : 'Send Email'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
