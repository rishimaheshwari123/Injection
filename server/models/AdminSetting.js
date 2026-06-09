import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  logoUrl: {
    type: String,
    default: null
  },
  signatureUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);
export default AdminSetting;
