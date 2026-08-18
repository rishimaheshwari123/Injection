import Ambassador from '../models/Ambassador.js';
import Vendor from '../models/Vendor.js';
import Otp from '../models/Otp.js';
import Service from '../models/Service.js';
import { normalizePhone } from '../utils/sms.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new Ambassador
 * @route   POST /api/ambassadors/register
 * @access  Public
 */
export const ambassadorRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dob,
      gender,
      
      // Address
      address,
      state,
      city,
      district,
      pincode,
      areaCovered,

      // Professional
      occupation,
      company,
      qualification,
      experience,
      joinAs,
      hasSalesExperience,
      hasDigitalMarketingExperience,

      // Bank
      upiId,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,

      // Documents URLs
      documents,

      // Declaration
      termsAccepted,
      signatureName,
      place,
      referredBy
    } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone || !dob || !gender || !address || !state || !city || !areaCovered || !signatureName || !place || !termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!documents || !documents.aadhaarFront) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar Card Front Side image is required'
      });
    }

    // Verify OTP first
    const normalizedPhone = normalizePhone(phone);
    const otpRecord = await Otp.findOne({ phone: normalizedPhone, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is not verified. Please verify using OTP first.'
      });
    }

    // Check if Ambassador already exists
    const ambassadorExists = await Ambassador.findOne({ email });
    if (ambassadorExists) {
      return res.status(400).json({
        success: false,
        message: 'Ambassador already exists with this email address'
      });
    }

    // Create Ambassador (status is inactive by default)
    const ambassador = await Ambassador.create({
      name,
      email,
      password,
      phone: normalizedPhone,
      isPhoneVerified: true,
      dob,
      gender,
      address,
      state,
      city,
      district,
      pincode,
      areaCovered,
      occupation,
      company,
      qualification,
      experience,
      joinAs: joinAs || 'Ambassador',
      hasSalesExperience: !!hasSalesExperience,
      hasDigitalMarketingExperience: !!hasDigitalMarketingExperience,
      upiId,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      documents,
      termsAccepted,
      signatureName,
      place,
      referredBy,
      isActive: false, // Must be activated by admin
      isVerified: false
    });

    // Remove OTP verification records
    await Otp.deleteMany({ phone: normalizedPhone });

    res.status(201).json({
      success: true,
      message: 'Ambassador registered successfully. Your account is pending admin verification.',
      data: ambassador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Login Ambassador
 * @route   POST /api/ambassadors/login
 * @access  Public
 */
export const ambassadorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find Ambassador
    const ambassador = await Ambassador.findOne({ email }).select('+password');
    if (!ambassador) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isMatch = await ambassador.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if active
    if (!ambassador.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending verification or has been deactivated. Please contact admin.'
      });
    }

    const token = generateToken(ambassador._id, 'ambassador');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...ambassador.toObject(),
          role: 'ambassador'
        },
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

/**
 * @desc    Get logged in Ambassador profile
 * @route   GET /api/ambassadors/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.ambassador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all vendors registered by current Ambassador
 * @route   GET /api/ambassadors/vendors
 * @access  Private
 */
export const getAmbassadorVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ ambassadorId: req.ambassador._id })
      .populate('services', 'serviceName category basePrice duration')
      .sort({ createdAt: -1 });

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

/**
 * @desc    Register a new Vendor through Ambassador dashboard
 * @route   POST /api/ambassadors/register-vendor
 * @access  Private
 */
export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      alternatePhone,
      gender,
      businessName,
      businessType,
      registrationNumber,
      gstNumber,
      qualifications,
      experience,
      specialization,
      address,
      city,
      state,
      pincode,
      longitude,
      latitude,
      serviceAreas,
      documents,
      availability,
      pricing,
      profileImage,
      bio,
      bankDetails,
      services
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !businessName || !businessType || !address || !city || !state || !pincode || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({
        success: false,
        message: 'Vendor already exists with this email address'
      });
    }

    const finalServices = Array.isArray(services) ? services : (services ? [services] : []);

    // Create vendor, link it to current Ambassador
    const vendor = await Vendor.create({
      name,
      email,
      password,
      phone,
      isPhoneVerified: true,
      alternatePhone,
      gender,
      businessName,
      businessType,
      registrationNumber,
      gstNumber,
      qualifications: qualifications || [],
      experience: experience || 0,
      specialization,
      address,
      city,
      state,
      pincode,
      longitude: Number(longitude),
      latitude: Number(latitude),
      serviceAreas: serviceAreas || [],
      documents,
      availability,
      pricing,
      profileImage,
      bio,
      bankDetails,
      services: finalServices,
      
      // Status
      isActive: false,
      isVerified: false,
      verificationStatus: 'pending',

      // Link to Ambassador
      referredBy: req.ambassador.referralCode,
      referredByRef: req.ambassador._id,
      referredByModel: 'Ambassador',
      ambassadorId: req.ambassador._id
    });

    // Bidirectional sync with services
    if (finalServices.length > 0) {
      await Service.updateMany({ _id: { $in: finalServices } }, { $addToSet: { vendors: vendor._id } });
    }

    // Add pending entry to Ambassador wallet history
    req.ambassador.walletHistory.push({
      vendorId: vendor._id,
      vendorName: vendor.name,
      amount: 100,
      status: 'pending',
      date: new Date()
    });
    await req.ambassador.save();

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully by Ambassador. Pending admin verification.',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get Ambassador wallet history
 * @route   GET /api/ambassadors/wallet-history
 * @access  Private
 */
export const getWalletHistory = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        walletBalance: req.ambassador.walletBalance,
        walletHistory: req.ambassador.walletHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Upload Ambassador document
 * @route   POST /api/ambassadors/upload
 * @access  Public
 */
export const uploadAmbassadorFile = async (req, res) => {
  try {
    if (!req.files || (!req.files.file && !req.files.image)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const uploadedFile = req.files.file || req.files.image;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, GIF, and PDF are allowed'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(uploadedFile.tempFilePath, {
      folder: 'ambassador_documents',
      resource_type: 'auto'
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Ambassador upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
};

/**
 * @desc    Helper to credit Ambassador wallet when a vendor is verified
 * @param   {object} vendor Mongoose vendor document
 */
export const creditAmbassadorForVendor = async (vendor) => {
  if (!vendor.ambassadorId || vendor.isAmbassadorCredited) return;

  try {
    const ambassador = await Ambassador.findById(vendor.ambassadorId);
    if (!ambassador) return;

    // Find if there is a pending entry in the wallet history
    const historyEntry = ambassador.walletHistory.find(
      (h) => h.vendorId && h.vendorId.toString() === vendor._id.toString()
    );

    if (historyEntry) {
      if (historyEntry.status === 'pending') {
        historyEntry.status = 'credited';
        ambassador.walletBalance += 100;
      }
    } else {
      // If vendor registers via referral code instead of directly by Ambassador dashboard,
      // they might not have a pending wallet entry yet. Create it here as credited.
      ambassador.walletHistory.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        amount: 100,
        status: 'credited',
        date: new Date()
      });
      ambassador.walletBalance += 100;
    }

    // Mark as credited on vendor model so we never credit again
    vendor.isAmbassadorCredited = true;

    await ambassador.save();
    console.log(`Credited 100 rupees to Ambassador ${ambassador.name} (${ambassador.ambassadorId}) for Vendor ${vendor.name}`);
  } catch (error) {
    console.error('Error crediting Ambassador wallet:', error.message);
  }
};

// ==========================================
// ADMIN CONTROLLER ACTIONS
// ==========================================

/**
 * @desc    Get all Ambassadors
 * @route   GET /api/ambassadors/admin/all
 * @access  Private/Admin
 */
export const adminGetAllAmbassadors = async (req, res) => {
  try {
    const ambassadors = await Ambassador.find({}).sort({ createdAt: -1 });
    
    // We want to count registered vendors for each ambassador dynamically
    const ambassadorData = [];
    for (const amb of ambassadors) {
      const vendorCount = await Vendor.countDocuments({ ambassadorId: amb._id });
      ambassadorData.push({
        ...amb.toObject(),
        vendorCount
      });
    }

    res.status(200).json({
      success: true,
      count: ambassadors.length,
      data: ambassadorData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Toggle Ambassador active status
 * @route   PUT /api/ambassadors/admin/:id/toggle-status
 * @access  Private/Admin
 */
export const adminToggleAmbassadorStatus = async (req, res) => {
  try {
    const ambassador = await Ambassador.findById(req.params.id);
    if (!ambassador) {
      return res.status(404).json({
        success: false,
        message: 'Ambassador not found'
      });
    }

    ambassador.isActive = !ambassador.isActive;
    if (ambassador.isActive) {
      ambassador.isVerified = true; // Auto-verify on first activation
    }
    await ambassador.save();

    res.status(200).json({
      success: true,
      message: `Ambassador status set to ${ambassador.isActive ? 'Active' : 'Inactive'}`,
      data: ambassador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single Ambassador details by ID (Admin view)
 * @route   GET /api/ambassadors/admin/:id
 * @access  Private/Admin
 */
export const adminGetAmbassadorById = async (req, res) => {
  try {
    const ambassador = await Ambassador.findById(req.params.id);
    if (!ambassador) {
      return res.status(404).json({
        success: false,
        message: 'Ambassador not found'
      });
    }
    const vendorCount = await Vendor.countDocuments({ ambassadorId: ambassador._id });
    res.status(200).json({
      success: true,
      data: {
        ...ambassador.toObject(),
        vendorCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all vendors registered by a specific Ambassador (Admin view)
 * @route   GET /api/ambassadors/admin/:id/vendors
 * @access  Private/Admin
 */
export const adminGetAmbassadorVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ ambassadorId: req.params.id })
      .populate('services', 'serviceName category basePrice duration')
      .sort({ createdAt: -1 });

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

/**
 * @desc    Initiate a wallet withdrawal request
 * @route   POST /api/ambassadors/withdraw
 * @access  Private/Ambassador
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const withdrawAmount = Number(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount'
      });
    }

    const ambassador = req.ambassador;

    if (ambassador.walletBalance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You only have ₹${ambassador.walletBalance}`
      });
    }

    // Deduct immediately
    ambassador.walletBalance -= withdrawAmount;

    // Push pending withdrawal request
    ambassador.withdrawalRequests.push({
      amount: withdrawAmount,
      status: 'pending',
      notes: 'Withdrawal request initiated.',
      date: new Date()
    });

    await ambassador.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully.',
      data: {
        walletBalance: ambassador.walletBalance,
        withdrawalRequests: ambassador.withdrawalRequests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all wallet withdrawal requests for current Ambassador
 * @route   GET /api/ambassadors/withdrawals
 * @access  Private/Ambassador
 */
export const getWithdrawals = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.ambassador.withdrawalRequests || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all wallet withdrawal requests (Admin view)
 * @route   GET /api/ambassadors/admin/withdrawals/all
 * @access  Private/Admin
 */
export const adminGetAllWithdrawals = async (req, res) => {
  try {
    const ambassadors = await Ambassador.find({ 'withdrawalRequests.0': { $exists: true } });
    
    const allRequests = [];
    for (const amb of ambassadors) {
      for (const r of amb.withdrawalRequests) {
        allRequests.push({
          requestId: r._id,
          amount: r.amount,
          status: r.status,
          notes: r.notes,
          date: r.date,
          ambassador: {
            _id: amb._id,
            ambassadorId: amb.ambassadorId,
            name: amb.name,
            email: amb.email,
            phone: amb.phone,
            upiId: amb.upiId,
            bankDetails: {
              accountHolderName: amb.accountHolderName,
              bankName: amb.bankName,
              accountNumber: amb.accountNumber,
              ifscCode: amb.ifscCode
            }
          }
        });
      }
    }

    // Sort by date descending
    allRequests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({
      success: true,
      count: allRequests.length,
      data: allRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update status of a wallet withdrawal request (Admin view)
 * @route   PUT /api/ambassadors/admin/withdrawals/:ambassadorId/:requestId
 * @access  Private/Admin
 */
export const adminUpdateWithdrawalStatus = async (req, res) => {
  try {
    const { ambassadorId, requestId } = req.params;
    const { status, notes } = req.body;

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be completed or cancelled.'
      });
    }

    const ambassador = await Ambassador.findById(ambassadorId);
    if (!ambassador) {
      return res.status(404).json({
        success: false,
        message: 'Ambassador not found'
      });
    }

    const request = ambassador.withdrawalRequests.id(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This withdrawal request has already been processed and marked as ${request.status}.`
      });
    }

    // If cancelled, refund balance
    if (status === 'cancelled') {
      ambassador.walletBalance += request.amount;
    }

    request.status = status;
    request.notes = notes || `Status updated to ${status} by admin.`;

    await ambassador.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal request status updated to ${status}.`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
