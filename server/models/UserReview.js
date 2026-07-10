import mongoose from 'mongoose';

const userReviewSchema = new mongoose.Schema({
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

// Static method to calculate average rating of the user/customer
userReviewSchema.statics.calculateAverageRating = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { userId: userId }
    },
    {
      $group: {
        _id: '$userId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].nRating
    });
  } else {
    await mongoose.model('User').findByIdAndUpdate(userId, {
      rating: 0,
      totalReviews: 0
    });
  }
};

// Call calculateAverageRating after save
userReviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.userId);
});

// Call calculateAverageRating after remove
userReviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.userId);
});

const UserReview = mongoose.model('UserReview', userReviewSchema);
export default UserReview;
