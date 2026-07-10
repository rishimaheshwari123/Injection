import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required'],
    unique: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Static method to calculate average rating of the vendor
reviewSchema.statics.calculateAverageRating = async function(vendorId) {
  const stats = await this.aggregate([
    {
      $match: { vendorId: vendorId }
    },
    {
      $group: {
        _id: '$vendorId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Vendor').findByIdAndUpdate(vendorId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].nRating
    });
  } else {
    await mongoose.model('Vendor').findByIdAndUpdate(vendorId, {
      rating: 0,
      totalReviews: 0
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.vendorId);
});

// Call calculateAverageRating after remove
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.vendorId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
