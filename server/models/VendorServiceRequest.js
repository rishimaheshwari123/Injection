import mongoose from 'mongoose';

const vendorServiceRequestSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'At least one service is required']
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
vendorServiceRequestSchema.index({ vendor: 1, status: 1 });
vendorServiceRequestSchema.index({ status: 1 });

const VendorServiceRequest = mongoose.model('VendorServiceRequest', vendorServiceRequestSchema);

export default VendorServiceRequest;
