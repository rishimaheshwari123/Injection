import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Automatically deletes the document after 10 minutes (600 seconds)
  }
}, {
  timestamps: true
});

// Ensure compound index for fast lookups
otpSchema.index({ phone: 1, verified: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
