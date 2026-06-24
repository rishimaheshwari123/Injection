import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  vendorId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  }],
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['new_booking', 'booking_update', 'general'],
    default: 'new_booking'
  },
  vendorStatus: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isAccepted: {
      type: Boolean,
      default: false
    }
  }],
  // Legacy fields (kept for backward compatibility, but not used in new system)
  isRead: {
    type: Boolean,
    default: false
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for faster querying by vendor and read status
notificationSchema.index({ vendorId: 1, isRead: 1 });
notificationSchema.index({ bookingId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
