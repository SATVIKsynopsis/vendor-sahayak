import mongoose, { Document, Schema } from 'mongoose';

// Interface for location
export interface ILocation {
  city: string;
  state: string;
  pincode: string;
  area?: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// Interface for business details
export interface IBusinessDetails {
  shopName?: string;
  gstNumber?: string;
  establishedYear?: number;
  employeeCount?: number;
}

// Interface for notification preferences
export interface INotificationPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
}

// Interface for user preferences
export interface IUserPreferences {
  notifications: INotificationPreferences;
  categories: string[];
  priceAlerts: boolean;
}

// Main User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  mobileNumber: string;
  name: string;
  businessType: 'street_vendor' | 'small_shop' | 'retailer' | 'wholesaler';
  location: ILocation;
  preferredLanguage: 'hindi' | 'english' | 'bengali' | 'tamil' | 'gujarati';
  isVerified: boolean;
  profilePicture?: string;
  businessDetails: IBusinessDetails;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  deviceTokens: string[];
  
  // Virtual fields
  fullAddress: string;
  
  // Methods
  updateLastActive(): Promise<IUser>;
  addDeviceToken(token: string): Promise<IUser>;
  removeDeviceToken(token: string): Promise<IUser>;
}

// Location sub-schema
const locationSchema = new Schema<ILocation>({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    match: /^[1-9][0-9]{5}$/,
  },
  area: {
    type: String,
    trim: true,
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    validate: {
      validator: (coords: number[]) => {
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 && // longitude
               coords[1] >= -90 && coords[1] <= 90;     // latitude
      },
      message: 'Coordinates must be [longitude, latitude] with valid ranges',
    },
  },
}, { _id: false });

// Business details sub-schema
const businessDetailsSchema = new Schema<IBusinessDetails>({
  shopName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  gstNumber: {
    type: String,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    uppercase: true,
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  },
  employeeCount: {
    type: Number,
    min: 1,
    max: 10000,
  },
}, { _id: false });

// Notification preferences sub-schema
const notificationPreferencesSchema = new Schema<INotificationPreferences>({
  sms: { type: Boolean, default: true },
  email: { type: Boolean, default: false },
  push: { type: Boolean, default: true },
}, { _id: false });

// User preferences sub-schema
const userPreferencesSchema = new Schema<IUserPreferences>({
  notifications: {
    type: notificationPreferencesSchema,
    default: () => ({ sms: true, email: false, push: true }),
  },
  categories: [{
    type: String,
    trim: true,
  }],
  priceAlerts: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

// Main User schema
const userSchema = new Schema<IUser>({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\+[1-9]\d{1,14}$/,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  businessType: {
    type: String,
    required: true,
    enum: ['street_vendor', 'small_shop', 'retailer', 'wholesaler'],
    index: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  preferredLanguage: {
    type: String,
    enum: ['hindi', 'english', 'bengali', 'tamil', 'gujarati'],
    default: 'hindi',
    index: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    match: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
  },
  businessDetails: {
    type: businessDetailsSchema,
    default: () => ({}),
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({
      notifications: { sms: true, email: false, push: true },
      categories: [],
      priceAlerts: true,
    }),
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  deviceTokens: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ mobileNumber: 1 }, { unique: true });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ businessType: 1 });
userSchema.index({ preferredLanguage: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const { area, city, state, pincode } = this.location;
  return `${area ? area + ', ' : ''}${city}, ${state} - ${pincode}`;
});

// Instance method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Instance method to add device token
userSchema.methods.addDeviceToken = function(token: string) {
  if (!this.deviceTokens.includes(token)) {
    this.deviceTokens.push(token);
  }
  return this.save();
};

// Instance method to remove device token
userSchema.methods.removeDeviceToken = function(token: string) {
  this.deviceTokens = this.deviceTokens.filter((t: string) => t !== token);
  return this.save();
};

// Static method to find users by location
userSchema.statics.findByLocation = function(
  longitude: number,
  latitude: number,
  radiusInMeters: number = 5000
) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusInMeters,
      },
    },
  });
};

// Static method to find by business type
userSchema.statics.findByBusinessType = function(businessType: string) {
  return this.find({ businessType }).sort({ createdAt: -1 });
};

// Pre-save middleware to validate coordinates
userSchema.pre('save', function(next) {
  if (this.isModified('location.coordinates')) {
    const [lng, lat] = this.location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return next(new Error('Invalid coordinates'));
    }
  }
  next();
});

// Transform output
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete (ret as any).__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
