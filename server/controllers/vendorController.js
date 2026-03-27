import Vendor from '../models/Vendor.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register vendor
// @route   POST /api/vendors/register
// @access  Public
export const vendorRegister = async (req, res) => {
  try {
    const vendorData = req.body;

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ email: vendorData.email });
    if (vendorExists) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already exists with this email'
      });
    }

    // Create vendor with pending status and inactive account
    const vendor = await Vendor.create({
      ...vendorData,
      isActive: false,
      isVerified: false,
      verificationStatus: 'pending'
    });

    const token = generateToken(vendor._id, 'vendor');

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Your account is pending admin verification.',
      data: {
        vendor,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login vendor
// @route   POST /api/vendors/login
// @access  Public
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for vendor
    const vendor = await Vendor.findOne({ email }).select('+password');

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await vendor.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if vendor is active
    if (!vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    const token = generateToken(vendor._id, 'vendor');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        vendor,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private/Admin
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single vendor by ID
// @route   GET /api/vendors/:id
// @access  Private
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private/Vendor
export const updateVendorProfile = async (req, res) => {
  try {
    const updateData = req.body;

    const vendor = await Vendor.findById(req.vendor._id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update all allowed fields
    const allowedFields = [
      'name', 'phone', 'alternatePhone', 'businessName', 'businessType',
      'registrationNumber', 'gstNumber', 'servicesOffered', 'qualifications',
      'experience', 'specialization', 'address', 'city', 'state', 'pincode',
      'serviceAreas', 'documents', 'availability', 'pricing', 'profileImage',
      'bio', 'bankDetails'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        vendor[field] = updateData[field];
      }
    });

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Activate/Verify vendor account
// @route   PUT /api/vendors/:id/activate
// @access  Private/Admin
export const activateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = true;
    vendor.isVerified = true;
    vendor.verificationStatus = 'verified';
    vendor.verificationDate = new Date();
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor account activated and verified successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deactivate vendor account
// @route   PUT /api/vendors/:id/deactivate
// @access  Private/Admin
export const deactivateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isActive = false;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor account deactivated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
