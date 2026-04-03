import mongoose from 'mongoose';

const jobPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  qualifications: {
    type: String,
    required: true
  },
  responsibilities: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('JobPost', jobPostSchema);
