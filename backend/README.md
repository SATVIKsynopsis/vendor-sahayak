# 🚀 Street Vendor Supplier Platform - Backend API

A comprehensive Node.js backend API for the Street Vendor Supplier Platform with MongoDB, mobile OTP authentication, and bilingual support.

## 📋 Features

### ✅ **Authentication & User Management**
- **Mobile OTP Authentication** with Twilio/Fast2SMS integration
- **JWT Token Management** with refresh token rotation
- **Rate Limiting** for security
- **User Profile Management** with location services
- **Device Token Management** for push notifications

### ✅ **Database & Performance**
- **MongoDB** with optimized schemas and indexes
- **Redis** for session management and caching
- **Geospatial Queries** for location-based features
- **Data Validation** with Mongoose schemas

### ✅ **Security & Validation**
- **Input Validation** with comprehensive middleware
- **Rate Limiting** for API endpoints
- **Secure Password Hashing** with bcrypt
- **CORS** and **Helmet** security headers

### ✅ **Developer Experience**
- **TypeScript** for type safety
- **Structured Logging** with Winston
- **Error Handling** with proper HTTP status codes
- **API Documentation** built-in

## 🛠 **Tech Stack**

- **Runtime**: Node.js 16+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **SMS**: Twilio/Fast2SMS integration
- **Logging**: Winston with structured logs
- **Validation**: Joi and custom middleware

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16 or higher
- MongoDB running locally or MongoDB Atlas
- Redis running locally (optional for development)

### **Installation**

1. **Clone and setup the project:**
   ```bash
   cd c:/Users/KIIT/Desktop/street-vendor/backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env file with your configuration
   # At minimum, set MONGODB_URI and JWT secrets
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **The API will be available at:**
   - **Local**: http://localhost:5000
   - **Health Check**: http://localhost:5000/api/health
   - **API Docs**: http://localhost:5000/

## 📡 **API Endpoints**

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Rate Limited |
|--------|----------|-------------|--------------|
| POST | `/send-otp` | Send OTP to mobile number | ✅ (5/10min) |
| POST | `/verify-otp` | Verify OTP and login/register | ✅ |
| POST | `/resend-otp` | Resend OTP with cooldown | ✅ (5/10min) |
| POST | `/complete-profile` | Complete user profile setup | ✅ |
| POST | `/refresh-token` | Refresh access token | ✅ |
| POST | `/logout` | Logout user | 🔒 |
| GET | `/me` | Get current user info | 🔒 |

### **User Management Routes** (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | 🔒 |
| PUT | `/profile` | Update user profile | 🔒 |
| POST | `/location` | Update user location | 🔒 |
| PUT | `/preferences` | Update user preferences | 🔒 |
| POST | `/device-token` | Add device token | 🔒 |
| DELETE | `/device-token` | Remove device token | 🔒 |
| GET | `/nearby` | Get nearby users | 🔒 |
| DELETE | `/account` | Delete user account | 🔒 |

**Legend:**
- 🔒 = Authentication required
- ✅ = Rate limited
- (5/10min) = 5 requests per 10 minutes

## 🗄️ **Database Schema**

### **Users Collection**
```javascript
{
  _id: ObjectId,
  mobileNumber: String, // Unique, indexed
  name: String,
  businessType: Enum,
  location: {
    city: String,
    state: String,
    pincode: String,
    area: String,
    coordinates: [Number] // 2dsphere indexed
  },
  preferredLanguage: Enum,
  isVerified: Boolean,
  profilePicture: String,
  businessDetails: Object,
  preferences: Object,
  deviceTokens: [String],
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```

### **OTP Verifications Collection**
```javascript
{
  _id: ObjectId,
  mobileNumber: String, // Indexed
  otp: String, // Hashed
  attempts: Number,
  isVerified: Boolean,
  expiresAt: Date, // TTL indexed
  createdAt: Date,
  ipAddress: String,
  deviceInfo: String
}
```

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### **Environment Variables**

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

**Optional for Development:**
- `TWILIO_ACCOUNT_SID` - Twilio SMS service
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `FAST2SMS_API_KEY` - Fast2SMS service (Indian SMS)
- `REDIS_URL` - Redis connection string
- `CLOUDINARY_*` - Image upload service

### **Project Structure**
```
src/
├── config/          # Database and app configuration
│   ├── database.ts  # MongoDB and Redis setup
│   └── index.ts     # App configuration
├── controllers/     # Request handlers
│   ├── authController.ts
│   └── userController.ts
├── middleware/      # Express middleware
│   └── auth.ts      # Authentication and validation
├── models/          # MongoDB models
│   ├── User.ts
│   └── OTPVerification.ts
├── routes/          # API routes
│   ├── auth.ts
│   ├── user.ts
│   └── index.ts
├── services/        # Business logic services
│   ├── authService.ts
│   └── smsService.ts
├── utils/           # Utilities
│   └── logger.ts
├── types/           # TypeScript type definitions
└── server.ts        # Main server file
```

## 🔒 **Security Features**

- **Rate Limiting**: Different limits for various endpoints
- **Input Validation**: Comprehensive request validation
- **JWT Security**: Secure token generation and validation
- **Password Hashing**: bcrypt with configurable rounds
- **CORS**: Proper cross-origin resource sharing
- **Helmet**: Security headers
- **MongoDB Injection Protection**: Through Mongoose

## 📱 **SMS Integration**

The API supports multiple SMS providers:

1. **Mock Service** (Development): Logs OTP to console
2. **Fast2SMS** (Recommended for India): Cost-effective Indian SMS
3. **Twilio** (Global): Reliable worldwide SMS service

## 🧪 **Testing**

### **API Testing with curl:**

1. **Send OTP:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"mobileNumber": "+919876543210", "language": "hindi"}'
   ```

2. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"mobileNumber": "+919876543210", "otp": "123456"}'
   ```

3. **Complete Profile:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/complete-profile \
     -H "Content-Type: application/json" \
     -d '{
       "mobileNumber": "+919876543210",
       "name": "राम कुमार",
       "businessType": "street_vendor",
       "location": {
         "city": "Delhi",
         "state": "Delhi",
         "pincode": "110001",
         "coordinates": [77.2300, 28.6562]
       }
     }'
   ```

## 🚀 **Production Deployment**

1. **Set NODE_ENV=production**
2. **Configure MongoDB Atlas connection**
3. **Set up Redis instance**
4. **Configure SMS service (Twilio/Fast2SMS)**
5. **Set strong JWT secrets**
6. **Enable proper logging and monitoring**

## 📞 **Support**

- **API Issues**: Check logs in `logs/` directory
- **Database Issues**: Ensure MongoDB is running and accessible
- **SMS Issues**: Verify SMS service credentials
- **Authentication Issues**: Check JWT secret configuration

---

## 🎯 **Next Steps**

Ready to implement:
1. **Chat System** with AI integration
2. **Supplier Management** system
3. **Notification System** with FCM
4. **File Upload** with Cloudinary
5. **Analytics & Reporting** features

The foundation is solid and ready for feature expansion! 🚀
