import mongoose, { Document, Schema } from 'mongoose';

export interface IOTPVerification extends Document {
  _id: mongoose.Types.ObjectId;
  mobileNumber: string;
  otp: string; // Hashed OTP
  attempts: number;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  deviceInfo?: string;
  
  // Instance methods
  incrementAttempts(): Promise<IOTPVerification>;
  markAsVerified(): Promise<IOTPVerification>;
}

const otpVerificationSchema = new Schema<IOTPVerification>({
  mobileNumber: {
    type: String,
    required: true,
    match: /^\+[1-9]\d{1,14}$/,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipAddress: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
}, {
  timestamps: false, // Using custom createdAt
});

// Index for cleanup of expired OTPs
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create new OTP
otpVerificationSchema.statics.createOTP = async function(
  mobileNumber: string,
  hashedOTP: string,
  expiryMinutes: number = 10,
  ipAddress?: string,
  deviceInfo?: string
) {
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  // Remove any existing OTP for this mobile number
  await this.deleteMany({ mobileNumber });
  
  return this.create({
    mobileNumber,
    otp: hashedOTP,
    expiresAt,
    ipAddress,
    deviceInfo,
  });
};

// Instance method to increment attempts
otpVerificationSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return this.save();
};

// Instance method to verify OTP
otpVerificationSchema.methods.markAsVerified = async function() {
  this.isVerified = true;
  return this.save();
};

// Define interface for statics
interface IOTPVerificationModel extends mongoose.Model<IOTPVerification> {
  createOTP(
    mobileNumber: string,
    hashedOTP: string,
    expiryMinutes?: number,
    ipAddress?: string,
    deviceInfo?: string
  ): Promise<IOTPVerification>;
}

export const OTPVerification = mongoose.model<IOTPVerification, IOTPVerificationModel>('OTPVerification', otpVerificationSchema);
