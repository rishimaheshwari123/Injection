import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Service Information
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  // Pricing
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Service Details
  duration: {
    type: Number, // in minutes
    default: 45
  },
  serviceType: {
    type: String,
    default: 'At Home'
  },
  
  // Vendor References
  vendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  
  // Service Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Additional Info
  icon: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  requirements: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
serviceSchema.index({ vendors: 1, isActive: 1 });
serviceSchema.index({ category: 1, isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
