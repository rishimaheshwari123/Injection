import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'vendor', 'ambassador', 'guest', 'admin'],
    required: true,
    default: 'guest'
  },
  ipAddress: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    enum: ['User', 'Vendor', 'Ambassador']
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  count: {
    type: Number,
    default: 1
  },
  lastVisited: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
