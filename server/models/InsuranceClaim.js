import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Number,
    required: true
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  insuranceProvider: {
    type: String,
    required: true
  },
  policyNumber: {
    type: String,
    required: true
  },
  claimType: {
    type: String,
    enum: ['Hospitalization', 'Diagnostic Tests', 'Pharmacy', 'Consultation', 'Other'],
    required: true
  },
  claimAmount: {
    type: Number,
    required: true
  },
  treatmentDate: {
    type: Date,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'More Info Required'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  approvedAmount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// No auto-generation - claim number will come from frontend
export default mongoose.model('InsuranceClaim', insuranceClaimSchema);
