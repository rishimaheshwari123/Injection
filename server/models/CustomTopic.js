import mongoose from 'mongoose';

const customTopicSchema = new mongoose.Schema({
  topicKey: {
    type: String,
    required: [true, 'Topic key name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Topic key name can only contain letters, numbers, and underscores']
  },
  firebaseKeyGroup: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: [true, 'Display label name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  autoSubscribe: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Middleware to pre-fill firebaseKeyGroup if not provided
customTopicSchema.pre('validate', function(next) {
  if (this.topicKey && !this.firebaseKeyGroup) {
    this.firebaseKeyGroup = `group_${this.topicKey}`;
  }
  next();
});

const CustomTopic = mongoose.model('CustomTopic', customTopicSchema);

export default CustomTopic;
