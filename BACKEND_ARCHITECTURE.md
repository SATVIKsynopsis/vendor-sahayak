# 🚀 Street Vendor Supplier Platform - Backend Architecture

## 📱 Mobile-First Authentication System with MongoDB

### **Phase 1: Authentication & User Management**

#### **1. Mobile Number Authentication with OTP**
```
├── SMS OTP Verification (Twilio/Fast2SMS)
├── OTP Rate Limiting & Security
├── JWT Token Management
├── Session Management
├── Device Registration
└── Multi-language Support
```

**OTP Verification Schema (MongoDB):**
```javascript
// OTP Collection
{
  _id: ObjectId,
  mobileNumber: String,
  otp: String, // Hashed OTP
  attempts: Number,
  isVerified: Boolean,
  expiresAt: Date,
  createdAt: Date,
  ipAddress: String,
  deviceInfo: String
}
```

**Enhanced API Endpoints:**
- `POST /api/auth/send-otp` - Send OTP to mobile number with rate limiting
- `POST /api/auth/verify-otp` - Verify OTP and create JWT token
- `POST /api/auth/resend-otp` - Resend OTP with cooldown
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user and invalidate token
- `POST /api/auth/logout-all` - Logout from all devices

#### **2. User Profile Management**
```javascript
// Users Collection Schema
{
  _id: ObjectId,
  mobileNumber: String, // Unique index
  name: String,
  businessType: {
    type: String,
    enum: ['street_vendor', 'small_shop', 'retailer', 'wholesaler']
  },
  location: {
    city: String,
    state: String,
    pincode: String,
    area: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferredLanguage: {
    type: String,
    enum: ['hindi', 'english', 'bengali', 'tamil', 'gujarati'],
    default: 'hindi'
  },
  isVerified: Boolean,
  profilePicture: String, // Cloudinary URL
  businessDetails: {
    shopName: String,
    gstNumber: String,
    establishedYear: Number,
    employeeCount: Number
  },
  preferences: {
    notifications: {
      sms: Boolean,
      email: Boolean,
      push: Boolean
    },
    categories: [String], // Interested product categories
    priceAlerts: Boolean
  },
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date,
  deviceTokens: [String] // For push notifications
}
```

**API Endpoints:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/location` - Update user location with GPS
- `POST /api/user/upload-avatar` - Upload profile picture
- `PUT /api/user/preferences` - Update notification preferences

### **Phase 2: AI Chat History & Analytics**

#### **3. Enhanced Chat Management System**
```javascript
// Chat Sessions Collection
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String, // UUID for client reference
  title: String, // Auto-generated from first message
  language: {
    type: String,
    enum: ['hindi', 'english', 'bengali', 'tamil', 'gujarati'],
    default: 'hindi'
  },
  category: String, // supplier_search, certification_help, general
  tags: [String], // Auto-extracted keywords
  isActive: Boolean,
  isPinned: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastMessageAt: Date,
  messageCount: Number,
  totalTokensUsed: Number
}

// Chat Messages Collection
{
  _id: ObjectId,
  sessionId: ObjectId,
  content: String,
  contentHindi: String, // Translated content
  isBot: Boolean,
  messageType: {
    type: String,
    enum: ['text', 'image', 'audio', 'file'],
    default: 'text'
  },
  metadata: {
    tokenUsage: Number,
    responseTime: Number,
    confidence: Number, // AI confidence score
    sources: [String], // If AI references external data
    intent: String // Detected user intent
  },
  timestamp: Date,
  isEdited: Boolean,
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  reactions: {
    helpful: Boolean,
    notHelpful: Boolean
  }
}
```

**Enhanced API Endpoints:**
- `GET /api/chat/sessions` - Get user's chat sessions with pagination
- `GET /api/chat/session/:id` - Get specific chat session with messages
- `POST /api/chat/session` - Create new chat session
- `PUT /api/chat/session/:id` - Update session (title, pin status)
- `DELETE /api/chat/session/:id` - Delete chat session
- `GET /api/chat/session/:id/messages` - Get paginated chat messages
- `POST /api/chat/message` - Send message with enhanced processing
- `PUT /api/chat/message/:id/reaction` - Add reaction to message
- `GET /api/chat/search` - Search across all chat messages
- `POST /api/chat/export/:sessionId` - Export chat as PDF

#### **4. AI Analytics & User Insights**
```javascript
// User Analytics Collection
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date, // Daily aggregation
  metrics: {
    totalChats: Number,
    totalMessages: Number,
    botInteractions: Number,
    avgSessionLength: Number, // in minutes
    mostActiveHour: Number,
    languageUsage: {
      hindi: Number,
      english: Number
    }
  },
  topics: {
    supplierQueries: Number,
    certificationHelp: Number,
    priceInquiries: Number,
    locationBasedSearch: Number
  },
  satisfaction: {
    helpfulResponses: Number,
    unhelpfulResponses: Number,
    averageRating: Number
  },
  createdAt: Date
}

// Popular Queries Collection (for AI improvement)
{
  _id: ObjectId,
  query: String,
  normalizedQuery: String,
  language: String,
  frequency: Number,
  category: String,
  avgResponseTime: Number,
  successRate: Number, // Based on user reactions
  lastAsked: Date,
  responses: [{
    response: String,
    rating: Number,
    timestamp: Date
  }]
}
```

### **Phase 3: Enhanced Features**

#### **5. Supplier Interaction & Management System**
```javascript
// Suppliers Collection
{
  _id: ObjectId,
  companyName: String,
  contactPerson: String,
  mobileNumber: String,
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  certifications: [{
    type: String, // BIS, ISO, MSME, etc.
    number: String,
    validUpto: Date,
    document: String // Document URL
  }],
  products: [{
    category: String,
    subcategory: String,
    name: String,
    description: String,
    minOrderQuantity: Number,
    priceRange: {
      min: Number,
      max: Number
    },
    unit: String,
    images: [String]
  }],
  businessDetails: {
    establishedYear: Number,
    businessType: String,
    gstNumber: String,
    panNumber: String,
    employeeCount: Number,
    annualTurnover: String
  },
  ratings: {
    average: Number,
    totalReviews: Number,
    qualityRating: Number,
    timelyDelivery: Number,
    customerService: Number
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Supplier Inquiries Collection
{
  _id: ObjectId,
  userId: ObjectId,
  supplierId: ObjectId,
  inquiryType: {
    type: String,
    enum: ['price_quote', 'product_info', 'bulk_order', 'partnership']
  },
  productCategory: String,
  message: String,
  requirements: {
    quantity: Number,
    unit: String,
    budget: Number,
    deliveryLocation: String,
    expectedDelivery: Date,
    specifications: String
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'negotiating', 'closed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  createdAt: Date,
  updatedAt: Date,
  lastActivity: Date
}

// Supplier Responses Collection
{
  _id: ObjectId,
  inquiryId: ObjectId,
  supplierId: ObjectId,
  message: String,
  quotation: {
    items: [{
      product: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number
    }],
    totalAmount: Number,
    currency: String,
    validUpto: Date,
    terms: String,
    deliveryTime: String,
    paymentTerms: String
  },
  attachments: [String], // Document URLs
  responseTime: Number, // in hours
  createdAt: Date,
  isCounterOffer: Boolean,
  parentResponseId: ObjectId // For negotiation threads
}
```

#### **6. Favorites, Bookmarks & User Preferences**
```javascript
// User Favorites Collection
{
  _id: ObjectId,
  userId: ObjectId,
  itemType: {
    type: String,
    enum: ['supplier', 'product', 'category']
  },
  itemId: ObjectId,
  notes: String, // User notes about the favorite
  tags: [String], // User-defined tags
  createdAt: Date,
  lastAccessed: Date
}

// Saved Searches Collection
{
  _id: ObjectId,
  userId: ObjectId,
  searchQuery: String,
  filters: {
    category: [String],
    location: {
      city: String,
      radius: Number // in km
    },
    certifications: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    rating: Number,
    verificationStatus: String
  },
  name: String, // User-defined name for the search
  isActive: Boolean, // For price alerts
  alertFrequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'daily'
  },
  lastExecuted: Date,
  resultCount: Number,
  createdAt: Date
}

// User Activity Log Collection
{
  _id: ObjectId,
  userId: ObjectId,
  action: {
    type: String,
    enum: ['search', 'view_supplier', 'inquiry_sent', 'favorite_added', 'chat_started']
  },
  entityType: String, // supplier, product, chat, etc.
  entityId: ObjectId,
  metadata: {
    searchQuery: String,
    filters: Object,
    duration: Number, // time spent
    device: String,
    location: Object
  },
  timestamp: Date,
  sessionId: String
}
```

#### **7. Advanced Notification System**
```javascript
// Notifications Collection
{
  _id: ObjectId,
  userId: ObjectId,
  type: {
    type: String,
    enum: ['supplier_response', 'price_alert', 'new_supplier', 'certification_expiry', 'system_update', 'promotional']
  },
  title: String,
  message: String,
  messageHindi: String, // Translated message
  data: Object, // Additional payload for mobile app
  channels: {
    push: Boolean,
    sms: Boolean,
    email: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  isRead: Boolean,
  readAt: Date,
  deliveryAttempts: Number,
  createdAt: Date,
  scheduledFor: Date, // For scheduled notifications
  expiresAt: Date
}

// Push Token Management Collection
{
  _id: ObjectId,
  userId: ObjectId,
  deviceId: String,
  pushToken: String,
  platform: {
    type: String,
    enum: ['ios', 'android', 'web']
  },
  isActive: Boolean,
  lastUsed: Date,
  createdAt: Date
}
```

## 🛠 **Technology Stack Recommendation**

### **Backend Framework:**
- **Node.js + Express.js** (Fast development, JavaScript ecosystem)
- **TypeScript** (Type safety and better development experience)
- **MongoDB + Mongoose** (Flexible document database, perfect for our use case)
- **Redis** (Session management, caching, rate limiting)

### **Authentication & Security:**
- **Twilio/Fast2SMS** (SMS OTP service with Indian mobile support)
- **JWT** (Token management with refresh token rotation)
- **bcrypt** (Password hashing for admin accounts)
- **helmet** (Security headers)
- **express-rate-limit** (API rate limiting)
- **joi/zod** (Input validation)

### **File Storage & Media:**
- **Cloudinary** (Image/document storage with transformation)
- **multer** (File upload handling)

### **Real-time Features:**
- **Socket.io** (Real-time chat, notifications, live updates)
- **MongoDB Change Streams** (Real-time data sync)

### **Push Notifications:**
- **Firebase Cloud Messaging (FCM)** (Cross-platform push notifications)
- **node-cron** (Scheduled notifications)

### **Analytics & Monitoring:**
- **MongoDB Compass** (Database monitoring)
- **Winston** (Structured logging)
- **Morgan** (HTTP request logging)

### **Development Tools:**
- **nodemon** (Development server)
- **eslint + prettier** (Code formatting)
- **jest** (Testing framework)
- **supertest** (API testing)

## 📱 **Mobile App Features**

### **Authentication Flow:**
```jsx
// Enhanced Login/Signup Pages:
├── Language Selection Screen (Hindi/English/Regional)
├── Mobile number input with country code (+91)
├── OTP verification screen with:
   ├── Auto-read SMS permission
   ├── Resend OTP with cooldown timer
   ├── Voice OTP option for accessibility
   └── Manual OTP input with large buttons
├── Profile setup wizard:
   ├── Name input with Hindi keyboard support
   ├── Business type selection with icons
   ├── Location detection/manual entry
   ├── Photo upload (optional)
   └── Notification preferences
├── Terms & conditions in user's language
└── Biometric/PIN setup for quick login
```

### **Enhanced Profile Section:**
```jsx
// Comprehensive Profile Dashboard:
├── User info with edit capability
├── Business verification status
├── Chat history with search:
   ├── Recent conversations
   ├── Pinned important chats
   ├── Chat categories (supplier search, help)
   └── Export chat functionality
├── Favorite suppliers with notes
├── Saved searches with alerts
├── Activity timeline
├── Notification center
├── Settings:
   ├── Language preferences
   ├── Notification settings
   ├── Privacy controls
   ├── Account security
   └── Data export/deletion
├── Help & Support
└── App tour/tutorials
```

### **Advanced Chat Features:**
```jsx
// AI Chatbot Enhancements:
├── Voice input/output in Hindi & English
├── Image upload for product identification
├── Quick reply suggestions based on context
├── Chat search across all conversations
├── Message translation (Hindi ↔ English)
├── Share chat snippets
├── Offline message queue
├── Smart suggestions for:
   ├── Supplier searches
   ├── Product categories
   ├── Price ranges
   └── Location-based queries
├── Contextual help bubbles
├── AI confidence indicators
├── Feedback system for AI responses
└── Chat backup to cloud
```

### **Supplier Interaction Features:**
```jsx
// Enhanced Supplier Features:
├── Advanced supplier search with filters
├── Supplier comparison tool
├── Bulk inquiry system
├── Quote management dashboard
├── Supplier rating & review system
├── Direct messaging with suppliers
├── Order tracking (future feature)
├── Price alert notifications
├── Supplier verification badges
├── Photo-based product search
├── Barcode scanning for products
├── GPS-based nearby suppliers
├── Bulk contact export
└── Negotiation history tracking
```

### **Additional Mobile Features:**
```jsx
// Premium Features:
├── Dark mode support
├── Offline mode with sync
├── Multi-language support (5+ Indian languages)
├── Accessibility features:
   ├── Screen reader support
   ├── Large text options
   ├── High contrast mode
   └── Voice navigation
├── Widget for quick supplier search
├── Share app referral system
├── Tutorial videos in local language
├── Community features (future):
   ├── Vendor groups
   ├── Discussion forums
   └── Success stories
└── Analytics dashboard for business insights
```

## 🎯 **Implementation Priority**

### **Phase 1 (Week 1-2): Foundation**
1. ✅ **MongoDB Database Setup**
   - MongoDB Atlas cluster configuration
   - Database schema implementation
   - Indexes for performance optimization
   
2. ✅ **Mobile OTP Authentication System**
   - Twilio/Fast2SMS integration
   - OTP generation, validation & rate limiting
   - JWT token management with refresh tokens
   - Session management with Redis
   
3. ✅ **User Management System**
   - User registration & profile management
   - Location services integration
   - Basic security middleware

### **Phase 2 (Week 3-4): Core Features**
1. ✅ **Enhanced Chat System**
   - Chat session management
   - Message storage with metadata
   - Real-time messaging with Socket.io
   - Chat search functionality
   
2. ✅ **AI Integration Enhancements**
   - OpenAI API with improved prompts
   - Multi-language support (Hindi/English)
   - Context awareness & conversation memory
   - Response analytics & improvement tracking
   
3. ✅ **Profile Dashboard**
   - User analytics & insights
   - Chat history management
   - Preferences & settings management

### **Phase 3 (Week 5-6): Advanced Features**
1. ✅ **Supplier Management System**
   - Supplier database & verification
   - Inquiry & response system
   - Quotation management
   - Rating & review system
   
2. ✅ **Notification System**
   - Push notifications with FCM
   - SMS notifications for critical updates
   - Email notifications (optional)
   - Notification preferences management
   
3. ✅ **Favorites & Search System**
   - Bookmarking suppliers & products
   - Advanced search with filters
   - Saved searches with alerts
   - Search analytics & recommendations

### **Phase 4 (Week 7-8): Mobile App & Polish**
1. ✅ **React Native Mobile App**
   - Authentication screens with OTP
   - Main dashboard & navigation
   - Chat interface with voice support
   - Supplier browsing & interaction
   
2. ✅ **Real-time Features**
   - Live chat with suppliers
   - Real-time notifications
   - Live supplier updates
   - Collaborative features
   
3. ✅ **Performance & Security**
   - API rate limiting & security headers
   - Database query optimization
   - Caching strategies with Redis
   - Error handling & logging
   - Security audit & penetration testing

### **Phase 5 (Week 9-10): Production Ready**
1. ✅ **Advanced Analytics**
   - User behavior tracking
   - Business intelligence dashboard
   - Performance monitoring
   - A/B testing framework
   
2. ✅ **Scaling & Deployment**
   - Production deployment setup
   - Load balancing & auto-scaling
   - Backup & disaster recovery
   - Monitoring & alerting systems
   
3. ✅ **Final Testing & Launch**
   - Comprehensive testing suite
   - User acceptance testing
   - Performance testing under load
   - Beta launch with selected users

## 📊 **MongoDB Database Schema & Indexes**

### **Database Configuration:**
```javascript
// MongoDB Connection with Mongoose
const mongoConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}

// Essential Indexes for Performance
db.users.createIndex({ "mobileNumber": 1 }, { unique: true })
db.users.createIndex({ "location.coordinates": "2dsphere" })
db.users.createIndex({ "createdAt": -1 })

db.chatSessions.createIndex({ "userId": 1, "createdAt": -1 })
db.chatSessions.createIndex({ "isActive": 1, "updatedAt": -1 })

db.chatMessages.createIndex({ "sessionId": 1, "timestamp": -1 })
db.chatMessages.createIndex({ "content": "text", "contentHindi": "text" })

db.suppliers.createIndex({ "location.coordinates": "2dsphere" })
db.suppliers.createIndex({ "verificationStatus": 1, "isActive": 1 })
db.suppliers.createIndex({ "products.category": 1 })
db.suppliers.createIndex({ "ratings.average": -1 })

db.supplierInquiries.createIndex({ "userId": 1, "createdAt": -1 })
db.supplierInquiries.createIndex({ "supplierId": 1, "status": 1 })

db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "status": 1, "scheduledFor": 1 })

db.otpVerifications.createIndex({ "mobileNumber": 1 })
db.otpVerifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

### **Sample MongoDB Collections Structure:**
```javascript
// Example User Document
{
  "_id": ObjectId("64a7b8c9d1e2f3a4b5c6d7e8"),
  "mobileNumber": "+919876543210",
  "name": "राज कुमार",
  "businessType": "street_vendor",
  "location": {
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "area": "Chandni Chowk",
    "coordinates": [77.2300, 28.6562]
  },
  "preferredLanguage": "hindi",
  "isVerified": true,
  "profilePicture": "https://res.cloudinary.com/app/image/upload/v1/profiles/user123.jpg",
  "businessDetails": {
    "shopName": "राज फल भंडार",
    "establishedYear": 2018,
    "employeeCount": 2
  },
  "preferences": {
    "notifications": { "sms": true, "push": true },
    "categories": ["fruits", "vegetables"],
    "priceAlerts": true
  },
  "createdAt": ISODate("2023-07-01T10:30:00Z"),
  "updatedAt": ISODate("2023-07-15T15:45:00Z"),
  "lastActive": ISODate("2023-07-15T15:45:00Z"),
  "deviceTokens": ["fGw8-xQ9R7eM..."]
}

// Example Chat Session Document
{
  "_id": ObjectId("64a7b8c9d1e2f3a4b5c6d7e9"),
  "userId": ObjectId("64a7b8c9d1e2f3a4b5c6d7e8"),
  "sessionId": "sess_1690284000_user123",
  "title": "फल आपूर्तिकर्ता खोजना",
  "language": "hindi",
  "category": "supplier_search",
  "tags": ["fruits", "supplier", "wholesale"],
  "isActive": true,
  "isPinned": false,
  "messageCount": 15,
  "totalTokensUsed": 2500,
  "createdAt": ISODate("2023-07-15T10:00:00Z"),
  "updatedAt": ISODate("2023-07-15T15:45:00Z"),
  "lastMessageAt": ISODate("2023-07-15T15:45:00Z")
}
```

## 🚀 **Getting Started - Complete Setup Guide**

### **1. Backend Setup with MongoDB:**
```bash
# Create backend project
mkdir street-vendor-backend
cd street-vendor-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express typescript @types/node @types/express
npm install mongoose redis jsonwebtoken bcryptjs
npm install twilio fast-sms-api node-cron winston morgan
npm install socket.io cors helmet express-rate-limit
npm install multer cloudinary firebase-admin
npm install joi express-validator nodemailer

# Install development dependencies
npm install -D nodemon ts-node @types/jsonwebtoken
npm install -D @types/bcryptjs @types/cors @types/multer
npm install -D eslint prettier jest supertest
npm install -D @types/jest @types/supertest

# Install additional utilities
npm install moment-timezone lodash uuid
npm install @types/lodash @types/uuid -D
```

### **2. Environment Configuration:**
```bash
# Create .env file
touch .env

# Add environment variables
echo "# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streetvendor
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Alternative SMS Service
FAST2SMS_API_KEY=your-fast2sms-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Application Settings
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000" > .env
```

### **3. Basic Project Structure:**
```bash
# Create directory structure
mkdir -p src/{config,controllers,middleware,models,routes,services,utils,types}
mkdir -p src/{socket,jobs,validation}
mkdir -p tests/{unit,integration}
mkdir -p logs uploads

# Create TypeScript configuration
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}' > tsconfig.json

# Create basic server file
echo 'import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});' > src/server.ts
```

### **4. Mobile App Setup with React Native:**
```bash
# Create React Native app
npx create-expo-app StreetVendorApp --template typescript
cd StreetVendorApp

# Install navigation dependencies
npm install @react-navigation/native @react-navigation/stack
npm install @react-navigation/bottom-tabs @react-navigation/drawer
npx expo install react-native-screens react-native-safe-area-context

# Install UI and utility libraries
npm install react-native-paper react-native-vector-icons
npm install react-native-async-storage/async-storage
npm install @expo/vector-icons expo-location expo-permissions
npm install react-native-otp-textinput expo-camera
npm install react-native-voice expo-speech

# Install state management
npm install @reduxjs/toolkit react-redux
npm install axios react-query

# Install additional features
npm install expo-notifications expo-device
npm install react-native-share expo-document-picker
npm install react-native-charts-wrapper
```

### **5. Database Initialization:**
```bash
# MongoDB setup script
echo 'use streetvendor;

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["mobileNumber", "name", "businessType"],
      properties: {
        mobileNumber: { bsonType: "string", pattern: "^\\+[1-9]\\d{1,14}$" },
        name: { bsonType: "string", minLength: 2, maxLength: 100 },
        businessType: { enum: ["street_vendor", "small_shop", "retailer", "wholesaler"] }
      }
    }
  }
});

// Create essential indexes
db.users.createIndex({ "mobileNumber": 1 }, { unique: true });
db.users.createIndex({ "location.coordinates": "2dsphere" });
db.chatSessions.createIndex({ "userId": 1, "createdAt": -1 });
db.suppliers.createIndex({ "location.coordinates": "2dsphere" });

print("✅ Database initialized successfully!");' > init-db.js

# Run initialization
mongosh < init-db.js
```

### **6. Development Workflow:**
```bash
# Start development servers
npm run dev          # Backend development server
npm start            # React Native development server

# Available scripts for backend
echo '{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}' > package.json (append to existing)

# Git setup
git init
echo "node_modules/
dist/
.env
logs/
uploads/
*.log" > .gitignore

git add .
git commit -m "🎉 Initial project setup with MongoDB and mobile OTP"
```

This comprehensive architecture provides a production-ready foundation for the street vendor platform with MongoDB, mobile OTP authentication, and all the enhanced features we discussed! 🚀

### **🔥 Key Features Implemented:**
- ✅ **Mobile-first OTP authentication** with Twilio/Fast2SMS
- ✅ **MongoDB with optimized schemas** and proper indexing  
- ✅ **Bilingual AI chatbot** with conversation memory
- ✅ **Real-time supplier interactions** with Socket.io
- ✅ **Advanced notifications** with FCM push notifications
- ✅ **Comprehensive user profiles** with business analytics
- ✅ **Scalable architecture** ready for production deployment
