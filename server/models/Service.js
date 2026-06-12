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
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Home Injections',
      'IV Drip Services',
      'Wound Dressing',
      'Day Care at Home',
      'Patient Monitoring',
      'Old Age Patient Care',
      '24 HR Patient Care',
      'Field Survey Service',
      'Data Collection Service',
      'Field Sample Collection',
      'Community Survey',
      'Awareness Activities',
      'Lab-based Training',
      'BSC/MSC Training',
      'DMLT Training',
      'Nursing Training',
      'Dissertation Program',
      'Placement Services',
      'Blood Collection',
      'BP/Sugar Monitoring',
      'ECG at Home',
      'Catheter Care',
      'Physiotherapy Session',
      'Other'
    ]
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
    enum: ['At Home', 'At Clinic', 'Both'],
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
