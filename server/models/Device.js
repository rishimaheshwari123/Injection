import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'FCM registration token is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  userType: {
    type: String,
    enum: ['user', 'vendor'],
    required: true
  },
  deviceType: {
    type: String,
    enum: ['android', 'ios', 'web'],
    default: 'web'
  },
  platform: {
    type: String,
    default: 'web'
  },
  appVersion: {
    type: String,
    default: '1.0.0'
  },
  topics: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexing for quick lookups
// Note: token field already has unique: true, so no need for separate index
deviceSchema.index({ userId: 1 });
deviceSchema.index({ vendorId: 1 });
deviceSchema.index({ userType: 1 });
deviceSchema.index({ topics: 1 });

const Device = mongoose.model('Device', deviceSchema);

export default Device;
