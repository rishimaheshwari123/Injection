import mongoose from 'mongoose';

const labPartnerSchema = new mongoose.Schema({
  // Lab Information
  labName: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  labAddress: {
    type: String,
    required: [true, 'Lab address is required']
  },
  labContact: {
    type: String,
    required: [true, 'Lab contact is required']
  },
  labEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  partnerType: {
    type: String,
    enum: ['Laboratory', 'Hospital', 'Diagnostic Center', 'Clinic', 'Other'],
    default: 'Laboratory'
  },
  
  // Patient Information
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientAge: {
    type: Number,
    required: [true, 'Patient age is required']
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Patient gender is required']
  },
  patientContact: {
    type: String,
    required: [true, 'Patient contact is required']
  },
  
  // Sample/Test Information
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    trim: true
  },
  sampleType: {
    type: String,
    required: [true, 'Sample type is required'],
    trim: true
  },
  sampleCollectionDate: {
    type: Date,
    required: [true, 'Sample collection date is required']
  },
  sampleSentDate: {
    type: Date,
    required: [true, 'Sample sent date is required']
  },
  
  // Status and Results
  status: {
    type: String,
    enum: ['Sent to Lab', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Sent to Lab'
  },
  expectedResultDate: {
    type: Date
  },
  actualResultDate: {
    type: Date
  },
  resultReceived: {
    type: Boolean,
    default: false
  },
  resultUrl: {
    type: String,
    default: null
  },
  
  // Additional Information
  remarks: {
    type: String,
    default: ''
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  cost: {
    type: Number,
    default: 0
  },
  
 
  
  // Tracking
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

// Index for faster queries
labPartnerSchema.index({ patientName: 1 });
labPartnerSchema.index({ labName: 1 });
labPartnerSchema.index({ status: 1 });
labPartnerSchema.index({ sampleSentDate: -1 });

const LabPartner = mongoose.model('LabPartner', labPartnerSchema);

export default LabPartner;
