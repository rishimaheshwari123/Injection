import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  alternatePhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  
  // Business Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['Individual', 'Clinic', 'Hospital', 'Laboratory', 'Pharmacy', 'Other'],
    required: [true, 'Business type is required']
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    // match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please provide a valid GST number']
  },
  
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  // Professional Details
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  },
  specialization: {
    type: String,
    trim: true
  },
  
  // Location Details
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
  },
  serviceAreas: [{
    type: String,
    trim: true
  }],
  
  // Documents
  documents: {
    identityProof: {
      type: String,
      url: String
    },
    qualificationCertificate: {
      type: String,
      url: String
    },
    businessLicense: {
      type: String,
      url: String
    },
    insuranceCertificate: {
      type: String,
      url: String
    }
  },
  
  // Availability
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      from: String,
      to: String
    }],
    emergencyAvailable: {
      type: Boolean,
      default: false
    }
  },
  
  // Pricing
  pricing: {
    consultationFee: Number,
    homeVisitFee: Number,
    emergencyFee: Number
  },
  
  // Status and Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: {
    type: Date
  },
  
  // Ratings and Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Profile
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Bank Details (for payments)
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branch: String
  }
}, {
  timestamps: true
});

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
vendorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
