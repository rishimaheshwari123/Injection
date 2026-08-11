import Otp from '../models/Otp.js';
import { sendOtpSMS, normalizePhone } from '../utils/sms.js';

/**
 * @desc    Generate and send OTP to phone number
 * @route   POST /api/otp/send
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
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
