'use client';

import { Phone, Mail, MapPin, Star, Shield, Award, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Supplier } from '@/types';

interface SupplierCardProps {
  supplier: Supplier;
  isHindi?: boolean;
}

export default function SupplierCard({ supplier, isHindi = false }: SupplierCardProps) {
  const router = useRouter();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/supplier/${supplier.id}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const getCertificationBadges = () => {
    const badges = [];
    if (supplier.certifications.bis) {
      badges.push(
        <span key="bis" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          BIS
        </span>
      );
    }
    if (supplier.certifications.iso) {
      badges.push(
        <span key="iso" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Award className="h-3 w-3 mr-1" />
          ISO
        </span>
      );
    }
    if (supplier.certifications.msme) {
      badges.push(
        <span key="msme" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          MSME
        </span>
      );
    }
    return badges;
  };

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {supplier.name}
              </h3>
              {supplier.verified && (
                <CheckCircle className="h-5 w-5 text-green-500" aria-label="Verified supplier" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{supplier.category}</p>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {supplier.location.city}, {supplier.location.state}
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriceRangeColor(supplier.priceRange)}`}>
              {supplier.priceRange === 'Low' ? (isHindi ? 'कम मूल्य' : 'Low Price') :
               supplier.priceRange === 'Medium' ? (isHindi ? 'मध्यम मूल्य' : 'Medium Price') :
               (isHindi ? 'उच्च मूल्य' : 'High Price')}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {renderStars(supplier.rating)}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {supplier.rating}
          </span>
          <span className="text-sm text-gray-500">
            ({supplier.totalReviews} {isHindi ? 'समीक्षाएं' : 'reviews'})
          </span>
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getCertificationBadges()}
        </div>

        {/* Products */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {isHindi ? 'उत्पाद:' : 'Products:'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {supplier.products.slice(0, 3).map((product, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {product}
              </span>
            ))}
            {supplier.products.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{supplier.products.length - 3} {isHindi ? 'और' : 'more'}
              </span>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href={`tel:${supplier.contactInfo.phone}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label={`Call ${supplier.name}`}
              >
                <Phone className="h-4 w-4 mr-2" />
                {isHindi ? 'कॉल करें' : 'Call'}
              </a>
              {supplier.contactInfo.email && (
                <a
                  href={`mailto:${supplier.contactInfo.email}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  aria-label={`Email ${supplier.name}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isHindi ? 'ईमेल करें' : 'Email'}
                </a>
              )}
            </div>
            <button 
              onClick={handleViewDetails}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isHindi ? 'विवरण देखें' : 'View Details'}
            </button>
          </div>
        </div>

        {/* Certification Details (Expandable) */}
        {supplier.certifications.details.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                <span>{isHindi ? 'प्रमाणन विवरण' : 'Certification Details'}</span>
                <svg className="ml-2 h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 pl-4">
                <ul className="text-xs text-gray-600 space-y-1">
                  {supplier.certifications.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
