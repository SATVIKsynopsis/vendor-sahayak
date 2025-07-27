import { Supplier } from '@/types';

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Mumbai Textile Mills',
    category: 'Textiles',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    certifications: {
      bis: true,
      iso: true,
      msme: true,
      details: ['BIS 2586:2018 (Cotton Fabrics)', 'ISO 9001:2015', 'MSME Registration']
    },
    rating: 4.5,
    totalReviews: 127,
    products: ['Cotton Fabric', 'Silk Fabric', 'Polyester Blend'],
    contactInfo: {
      phone: '+91 9876543210',
      email: 'info@mumbaitextiles.com',
      address: 'Shop 15, Textile Market, Mumbai - 400001'
    },
    verified: true,
    priceRange: 'Medium',
    image: '/images/textile-mill.jpg'
  },
  {
    id: '2',
    name: 'Fresh Farm Produce',
    category: 'Food & Beverages',
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    certifications: {
      bis: true,
      iso: false,
      msme: true,
      details: ['BIS 15842:2019 (Organic Food)', 'MSME Registration', 'FSSAI License']
    },
    rating: 4.2,
    totalReviews: 89,
    products: ['Fresh Vegetables', 'Fruits', 'Grains'],
    contactInfo: {
      phone: '+91 8765432109',
      address: 'Sector 12, Agricultural Market, Pune - 411001'
    },
    verified: true,
    priceRange: 'Low'
  },
  {
    id: '3',
    name: 'Craftsman Tools & Hardware',
    category: 'Tools & Hardware',
    location: {
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    certifications: {
      bis: true,
      iso: true,
      msme: false,
      details: ['BIS 1363:2019 (Hand Tools)', 'ISO 9001:2015']
    },
    rating: 4.7,
    totalReviews: 203,
    products: ['Hand Tools', 'Hardware', 'Safety Equipment'],
    contactInfo: {
      phone: '+91 7654321098',
      email: 'sales@craftmantools.com',
      address: 'Block A, Hardware Market, Delhi - 110001'
    },
    verified: true,
    priceRange: 'High'
  },
  {
    id: '4',
    name: 'Spice Garden',
    category: 'Food & Beverages',
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    },
    certifications: {
      bis: true,
      iso: false,
      msme: true,
      details: ['BIS 1797:2008 (Spices)', 'MSME Registration', 'Agmark Certification']
    },
    rating: 4.3,
    totalReviews: 156,
    products: ['Whole Spices', 'Ground Spices', 'Spice Blends'],
    contactInfo: {
      phone: '+91 6543210987',
      address: 'Lane 5, Spice Market, Chennai - 600001'
    },
    verified: true,
    priceRange: 'Medium'
  },
  {
    id: '5',
    name: 'Beauty Care Supplies',
    category: 'Beauty & Personal Care',
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    certifications: {
      bis: true,
      iso: true,
      msme: true,
      details: ['BIS 13936:2018 (Cosmetics)', 'ISO 22716:2007', 'MSME Registration']
    },
    rating: 4.1,
    totalReviews: 74,
    products: ['Skincare Products', 'Hair Care', 'Cosmetics'],
    contactInfo: {
      phone: '+91 5432109876',
      email: 'info@beautycaresupplies.com',
      address: 'Complex 8, Beauty Market, Bangalore - 560001'
    },
    verified: true,
    priceRange: 'Medium'
  },
  {
    id: '6',
    name: 'Electronics Hub',
    category: 'Electronics',
    location: {
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    },
    certifications: {
      bis: true,
      iso: false,
      msme: true,
      details: ['BIS 13252:2018 (Electronics)', 'MSME Registration']
    },
    rating: 3.9,
    totalReviews: 92,
    products: ['Mobile Accessories', 'Small Electronics', 'Cables'],
    contactInfo: {
      phone: '+91 4321098765',
      address: 'Shop 23, Electronics Market, Kolkata - 700001'
    },
    verified: true,
    priceRange: 'Low'
  }
];

export const categories = [
  'All Categories',
  'Textiles',
  'Food & Beverages',
  'Tools & Hardware',
  'Beauty & Personal Care',
  'Electronics',
  'Home & Kitchen',
  'Sports & Fitness'
];

export const states = [
  'All States',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Karnataka',
  'West Bengal',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh'
];

export const certificationTypes = [
  'All Certifications',
  'BIS Certified',
  'ISO Certified',
  'MSME Registered'
];
