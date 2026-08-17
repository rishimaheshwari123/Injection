import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter.js';

const userSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
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
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age must be less than 120']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
  },
  alternateMobile: {
    type: String
  },
  currentLocation: {
    type: String,
    trim: true
  },
  
  // Insurance Information
  hasInsurance: {
    type: Boolean,
    default: false
  },
  insuranceType: {
    type: String,
    enum: ['Primary', 'Secondary'],
    default: 'Primary'
  },
  insurancePolicyNumber: {
    type: String,
    trim: true
  },
  insuranceProvider: {
    type: String,
    trim: true
  },
  insuranceExpiryDate: {
    type: Date
  },
  
  // Medical Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  allergies: [{
    name: { type: String, trim: true },
    since: { type: String, trim: true }
  }],
  chronicDiseases: [{
    name: { type: String, trim: true },
    since: { type: String, trim: true }
  }],
  currentMedications: [{
    name: { type: String, trim: true },
    since: { type: String, trim: true }
  }],
  
  // Emergency Contact
  emergencyContactName: {
    type: String,
    trim: true
  },
  emergencyContactPhone: {
    type: String
  },
  emergencyContactRelation: {
    type: String,
    trim: true
  },
  
  // Additional Information
  additionalNotes: {
    type: String,
    trim: true
  },
  preferredLanguage: {
    type: String,
    enum: ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Other'],
    default: 'English'
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin', 'staff'],
    default: 'user'
  },
  isStaff: {
    type: Boolean,
    default: false
  },
  permissions: {
    dashboard: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    vendors: { type: Boolean, default: false },
    services: { type: Boolean, default: false },
    bookings: { type: Boolean, default: false },
    prescriptions: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    labPartners: { type: Boolean, default: false },
    insuranceClaims: { type: Boolean, default: false },
    faqs: { type: Boolean, default: false },
    coupons: { type: Boolean, default: false },
    supportTickets: { type: Boolean, default: false },
    contactInquiries: { type: Boolean, default: false },
    advertisements: { type: Boolean, default: false },
    staff: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  medicalReport: {
    type: String,
    default: null
  },
  bloodReport: {
    type: String,
    default: null
  },
  historyDocument: {
    type: String,
    default: null
  },
  otherDocument: {
    type: String,
    default: null
  },
  lastLoginAt: {
    type: Date
  },
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
  familyMembers: [{
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    relationship: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true }
  }],
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: String
  },
  referredByRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referredByModel'
  },
  referredByModel: {
    type: String,
    enum: ['User', 'Vendor']
  }
}, {
  timestamps: true
});

// Helper function to generate a globally unique referral code
const generateUniqueReferralCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    let userMatch = null;
    if (mongoose.models.User) {
      userMatch = await mongoose.models.User.findOne({ referralCode: code });
    }
    let vendorMatch = null;
    if (mongoose.models.Vendor) {
      vendorMatch = await mongoose.models.Vendor.findOne({ referralCode: code });
    }
    if (!userMatch && !vendorMatch) {
      isUnique = true;
    }
  }
  return code;
};

// Generate unique referral code before saving for new user accounts
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    try {
      this.referralCode = await generateUniqueReferralCode();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Generate unique patientId/userId before saving using Counter model
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.patientId) {
    try {
      const prefix = 'PAT';
      
      // Atomically increment sequence for this prefix
      const counter = await Counter.findOneAndUpdate(
        { id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const formattedNum = String(counter.seq).padStart(3, '0');
      this.patientId = `${prefix}${formattedNum}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
