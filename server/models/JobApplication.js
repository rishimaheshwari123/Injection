import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  resumePublicId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Shortlisted', 'Rejected', 'Accepted'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('JobApplication', jobApplicationSchema);
