import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
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
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Billing', 'General', 'Booking', 'Service', 'Other'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate ticket number before validation
supportTicketSchema.pre('validate', async function(next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('SupportTicket', supportTicketSchema);
