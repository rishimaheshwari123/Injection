import Booking from '../models/Booking.js';
import { v2 as cloudinary } from 'cloudinary';

// @desc    Upload prescription for booking
// @route   POST /api/prescriptions/upload/:bookingId
// @access  Private/User
export const uploadPrescription = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { prescriptionUrl } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload prescription for this booking'
      });
    }

    booking.prescriptionDocument = prescriptionUrl;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get prescription for booking
// @route   GET /api/prescriptions/:bookingId
// @access  Private (User/Vendor/Admin)
export const getPrescription = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isUser = req.user && booking.userId._id.toString() === req.user._id.toString();
    const isVendor = req.vendor && booking.vendorId && booking.vendorId._id.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this prescription'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        prescriptionUrl: booking.prescriptionDocument,
        patientName: booking.patientName,
        uploadedAt: booking.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:bookingId
// @access  Private/User
export const deletePrescription = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete prescription for this booking'
      });
    }

    booking.prescriptionDocument = null;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload image to Cloudinary
// @route   POST /api/prescriptions/upload-image
// @access  Private/User
export const uploadImageToCloudinary = async (req, res) => {
  try {
    const { image } = req.body; // base64 image

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: process.env.FOLDER_NAME || 'prescriptions',
      resource_type: 'auto'
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
