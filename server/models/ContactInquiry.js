import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Read', 'Responded', 'Closed'],
    default: 'New'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate inquiry number before validation
contactInquirySchema.pre('validate', async function(next) {
  if (!this.inquiryNumber) {
    const count = await mongoose.model('ContactInquiry').countDocuments();
    this.inquiryNumber = `INQ${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('ContactInquiry', contactInquirySchema);
