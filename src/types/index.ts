export interface Supplier {
  id: string;
  name: string;
  category: string;
  location: {
    city: string;
    state: string;
    pincode: string;
  };
  certifications: {
    bis: boolean;
    iso: boolean;
    msme: boolean;
    details: string[];
  };
  rating: number;
  totalReviews: number;
  products: string[];
  contactInfo: {
    phone: string;
    email?: string;
    address: string;
  };
  verified: boolean;
  priceRange: 'Low' | 'Medium' | 'High';
  image?: string;
}

export interface FilterOptions {
  category: string;
  location: string;
  certification: string;
  priceRange: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}
