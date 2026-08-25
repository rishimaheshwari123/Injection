import Otp from '../models/Otp.js';
import { sendOtpSMS, normalizePhone } from '../utils/sms.js';

/**
 * @desc    Generate and send OTP to phone number
 * @route   POST /api/otp/send
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone, type, isForgotPassword } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type (user, vendor, or ambassador) is required'
      });
    }

    const allowedTypes = ['user', 'vendor', 'ambassador'];
    if (!allowedTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be user, vendor, or ambassador'
      });
    }

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Check account existence / registration status
    const lowerType = type.toLowerCase();
    let accountExists = false;

    if (lowerType === 'user') {
      const User = (await import('../models/User.js')).default;
      const user = await User.findOne({ phone: normalized });
      accountExists = !!user;
    } else if (lowerType === 'vendor') {
      const Vendor = (await import('../models/Vendor.js')).default;
      const vendor = await Vendor.findOne({ phone: normalized });
      accountExists = !!vendor;
    } else if (lowerType === 'ambassador') {
      const Ambassador = (await import('../models/Ambassador.js')).default;
      const ambassador = await Ambassador.findOne({ phone: normalized });
      accountExists = !!ambassador;
    }

    if (isForgotPassword) {
      if (!accountExists) {
        return res.status(400).json({
          success: false,
          message: `Phone number is not registered as a ${type}`
        });
      }
    } else {
      if (accountExists) {
        return res.status(400).json({
          success: false,
          message: `Phone number is already registered as a ${type}`
        });
      }
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Update the OTP in DB with verified = false
    await Otp.findOneAndUpdate(
      { phone: normalized },
      { otp, verified: false, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Call the SMS gateway to send the OTP code
    await sendOtpSMS(normalized, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /api/otp/verify
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP code are required'
      });
    }

    const normalized = normalizePhone(phone);
    
    // Find the latest OTP record for this phone number
    const otpRecord = await Otp.findOne({ phone: normalized });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.'
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please try again.'
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Reset password using verified phone number OTP
 * @route   POST /api/otp/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { phone, type, newPassword } = req.body;

    if (!phone || !type || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, account type, and new password are required'
      });
    }

    const allowedTypes = ['user', 'vendor', 'ambassador'];
    if (!allowedTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be user, vendor, or ambassador'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalized = normalizePhone(phone);

    // Check if OTP is verified
    const otpRecord = await Otp.findOne({ phone: normalized, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is not verified. Please verify using OTP first.'
      });
    }

    const lowerType = type.toLowerCase();
    let account = null;

    if (lowerType === 'user') {
      const User = (await import('../models/User.js')).default;
      account = await User.findOne({ phone: normalized });
    } else if (lowerType === 'vendor') {
      const Vendor = (await import('../models/Vendor.js')).default;
      account = await Vendor.findOne({ phone: normalized });
    } else if (lowerType === 'ambassador') {
      const Ambassador = (await import('../models/Ambassador.js')).default;
      account = await Ambassador.findOne({ phone: normalized });
    }

    if (!account) {
      return res.status(400).json({
        success: false,
        message: `Account not found with this phone number`
      });
    }

    // Update password
    account.password = newPassword;
    await account.save();

    // Clean up OTP record
    await Otp.deleteMany({ phone: normalized });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
