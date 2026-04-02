import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Patient Information
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age must be less than 120']
  },
  sex: {
    type: String,
    required: [true, 'Sex is required'],
    enum: ['Male', 'Female', 'Other']
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
  currentLocation: {
    type: String,
    required: [true, 'Current location is required']
  },
  alternateMobile: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },

  // Selected Services
  selectedServices: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }],

  // Additional Information
  additionalRequirements: {
    type: String,
    trim: true
  },
  
  // Prescription Information (Array - Multiple prescriptions allowed)
  prescriptions: [{
    type: {
      type: String,
      enum: ['form', 'image'],
      required: true
    },
    // Doctor Information
    doctorName: {
      type: String,
      trim: true
    },
    doctorRegistration: {
      type: String,
      trim: true
    },
    hospitalName: {
      type: String,
      trim: true
    },
    // Clinical Details
    patientComplaints: {
      type: String,
      trim: true
    },
    diagnosis: {
      type: String,
      trim: true
    },
    // Medications
    medications: [{
      name: {
        type: String,
        trim: true
      },
      dosage: {
        type: String,
        trim: true
      },
      frequency: {
        type: String,
        trim: true
      },
      duration: {
        type: String,
        trim: true
      }
    }],
    // Additional
    labTests: {
      type: String,
      trim: true
    },
    specialInstructions: {
      type: String,
      trim: true
    },
    followUpDate: {
      type: Date
    },
    // Image URLs
    imageUrl: {
      type: String, // Cloudinary URL for prescription image
      default: null
    },
    supportingImageUrl: {
      type: String, // Supporting document when form is used
      default: null
    },
    // Metadata
    addedBy: {
      type: String,
      default: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  hasInsurance: {
    type: Boolean,
    default: false
  },
  insurancePolicyNumber: {
    type: String,
    trim: true
  },

  // Pricing (Frontend Calculated)
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: 0
  },
  gstAmount: {
    type: Number,
    required: [true, 'GST amount is required'],
    min: 0
  },
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: 0
  },

  // Preferences
  freeComplimentaryService: {
    type: String,
    enum: ['Blood Sugar', 'Blood Group', 'Haemoglobin', 'None'],
    default: 'None'
  },
  preferredTimeSlot: {
    type: String,
    required: [true, 'Preferred time slot is required']
  },
  staffPreference: {
    type: String,
    enum: ['Any Available', 'Male Staff', 'Female Staff'],
    default: 'Any Available'
  },
  serviceLocation: {
    type: String,
    default: 'At Home'
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 45
  },

  // User & Vendor References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },

  // Booking Status
  bookingStatus: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },

  // Reports (Multiple reports allowed)
  reports: [{
    reportUrl: {
      type: String,
      required: true
    },
    reportType: {
      type: String,
      enum: ['lab', 'imaging', 'general', 'other'],
      default: 'general'
    },
    reportName: {
      type: String,
      trim: true
    },
    addedBy: {
      type: String,
      default: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Legacy field (kept for backward compatibility)
  reportUrl: {
    type: String,
    default: null
  },
  reportGeneratedAt: {
    type: Date
  },
  
  // Notes (Multiple notes with timestamp)
  notes: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: String,
      default: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ userId: 1, bookingStatus: 1 });
bookingSchema.index({ vendorId: 1, bookingStatus: 1 });
bookingSchema.index({ bookingStatus: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
