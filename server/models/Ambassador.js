import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './Counter.js';

const ambassadorSchema = new mongoose.Schema({
  ambassadorId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
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
  dob: {
    type: String,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  
  // Address Details
  address: {
    type: String,
    required: [true, 'Current address is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pin code']
  },
  areaCovered: {
    type: String,
    required: [true, 'Area / Locality you will cover is required'],
    trim: true
  },

  // Professional details
  occupation: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  joinAs: {
    type: String,
    enum: ['City Venue Partner', 'Area Coordinator', 'Ambassador', 'Other'],
    default: 'Ambassador'
  },
  hasSalesExperience: {
    type: Boolean,
    default: false
  },
  hasDigitalMarketingExperience: {
    type: Boolean,
    default: false
  },

  // Bank & UPI details
  upiId: {
    type: String,
    trim: true
  },
  accountHolderName: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true
  },

  // Documents
  documents: {
    aadhaarFront: {
      type: String,
      required: [true, 'Aadhaar Card Front Side is required']
    },
    aadhaarBack: {
      type: String
    },
    panCard: {
      type: String
    },
    passportPhoto: {
      type: String
    }
  },

  // Declarations
  termsAccepted: {
    type: Boolean,
    required: [true, 'You must accept the terms and conditions'],
    default: false
  },
  signatureName: {
    type: String,
    required: [true, 'Applicant signature/full name is required'],
    trim: true
  },
  place: {
    type: String,
    required: [true, 'Place is required'],
    trim: true
  },

  // Account Status
  role: {
    type: String,
    default: 'ambassador'
  },
  isActive: {
    type: Boolean,
    default: false // Admin must activate Ambassador first
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  // Wallet
  walletBalance: {
    type: Number,
    default: 0
  },
  walletHistory: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    vendorName: {
      type: String
    },
    amount: {
      type: Number,
      default: 100
    },
    status: {
      type: String,
      enum: ['pending', 'credited'],
      default: 'pending'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  withdrawalRequests: [{
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // Referrals
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: String
  }
}, {
  timestamps: true
});

// Helper function to generate a unique referral code
const generateUniqueReferralCode = async () => {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = 'AMB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    let userMatch = null;
    if (mongoose.models.User) {
      userMatch = await mongoose.models.User.findOne({ referralCode: code });
    }
    let vendorMatch = null;
    if (mongoose.models.Vendor) {
      vendorMatch = await mongoose.models.Vendor.findOne({ referralCode: code });
    }
    let ambassadorMatch = null;
    if (mongoose.models.Ambassador) {
      ambassadorMatch = await mongoose.models.Ambassador.findOne({ referralCode: code });
    }
    if (!userMatch && !vendorMatch && !ambassadorMatch) {
      isUnique = true;
    }
  }
  return code;
};

// Pre-save hooks
ambassadorSchema.pre('save', async function(next) {
  // Generate referral code
  if (this.isNew && !this.referralCode) {
    try {
      this.referralCode = await generateUniqueReferralCode();
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate ambassadorId
  if (this.isNew && !this.ambassadorId) {
    try {
      const prefix = 'AMB';
      const counter = await Counter.findOneAndUpdate(
        { id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const formattedNum = String(counter.seq).padStart(3, '0');
      this.ambassadorId = `${prefix}${formattedNum}`;
    } catch (error) {
      return next(error);
    }
  }
  
  // Hash password
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

// Compare password
ambassadorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// toJSON override
ambassadorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Ambassador = mongoose.model('Ambassador', ambassadorSchema);

export default Ambassador;
