import Vendor from '../models/Vendor.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import AdminSetting from '../models/AdminSetting.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import Otp from '../models/Otp.js';
import { normalizePhone } from '../utils/sms.js';

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
    // Destructure and validate fields from request body
    const {
      // Basic Information
      name,
      email,
      password,
      phone,
      alternatePhone,
      gender,

      // Business Information
      businessName,
      businessType,
      registrationNumber,
      gstNumber,

      // Professional Details
      qualifications,
      experience,
      specialization,

      // Location Details
      address,
      city,
      state,
      pincode,
      longitude,
      latitude,
      serviceAreas,

      // Documents
      documents,

      // Availability
      availability,

      // Pricing
      pricing,

      // Profile
      profileImage,
      bio,

      // Bank Details
      bankDetails,

      // Selected Services
      services,

      // Referral Info
      referredBy
    } = req.body;

    // Resolve referred by reference dynamically if provided
    let referredByRef = null;
    let referredByModel = null;
    if (referredBy && typeof referredBy === 'string' && referredBy.trim() !== '') {
      const trimmedRefCode = referredBy.trim().toUpperCase();
      const referringUser = await User.findOne({ referralCode: trimmedRefCode });
      if (referringUser) {
        referredByRef = referringUser._id;
        referredByModel = 'User';
      } else {
        const referringVendor = await Vendor.findOne({ referralCode: trimmedRefCode });
        if (referringVendor) {
          referredByRef = referringVendor._id;
          referredByModel = 'Vendor';
        } else {
          const Ambassador = (await import('../models/Ambassador.js')).default;
          const referringAmbassador = await Ambassador.findOne({ referralCode: trimmedRefCode });
          if (referringAmbassador) {
            referredByRef = referringAmbassador._id;
            referredByModel = 'Ambassador';
          }
        }
      }
    }

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const otpRecord = await Otp.findOne({ phone: normalizedPhone, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is not verified. Please verify using OTP first.'
      });
    }

    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Business name and type are required'
      });
    }

    if (!address || !city || !state || !pincode || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Complete address information including latitude and longitude is required'
      });
    }

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      if (process.env.NODE_ENV === 'development') {
        // Clean up references and delete existing vendor in development to allow recreating
        await Service.updateMany({ vendors: vendorExists._id }, { $pull: { vendors: vendorExists._id } });
        await Vendor.findByIdAndDelete(vendorExists._id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Vendor already exists with this email'
        });
      }
    }

    const finalServices = Array.isArray(services) ? services : (services ? [services] : []);

    // Create vendor with pending status and inactive account
    const vendor = await Vendor.create({
      // Basic Information
      name,
      email,
      password,
      phone,
      isPhoneVerified: true,
      alternatePhone,
      gender,

      // Business Information
      businessName,
      businessType,
      registrationNumber,
      gstNumber,

      // Professional Details
      qualifications: qualifications || [],
      experience: experience || 0,
      specialization,

      // Location Details
      address,
      city,
      state,
      pincode,
      longitude: Number(longitude),
      latitude: Number(latitude),
      serviceAreas: serviceAreas || [],

      // Documents
      documents,

      // Availability
      availability,

      // Pricing
      pricing,

      // Profile
      profileImage,
      bio,

      // Bank Details
      bankDetails,

      services: finalServices,

      // Status (forced for registration)
      isActive: false,
      isVerified: false,
      verificationStatus: 'pending',

      referredBy: referredBy || '',
      referredByRef,
      referredByModel,
      ambassadorId: referredByModel === 'Ambassador' ? referredByRef : null
    });

    // If referred by Ambassador, add pending reward to their history
    if (referredByModel === 'Ambassador' && referredByRef) {
      const Ambassador = (await import('../models/Ambassador.js')).default;
      const ambassador = await Ambassador.findById(referredByRef);
      if (ambassador) {
        ambassador.walletHistory.push({
          vendorId: vendor._id,
          vendorName: vendor.name,
          amount: 100,
          status: 'pending',
          date: new Date()
        });
        await ambassador.save();
      }
    }

    // Bidirectional sync: add this vendor to the selected services
    if (finalServices.length > 0) {
      await Service.updateMany({ _id: { $in: finalServices } }, { $addToSet: { vendors: vendor._id } });
    }

    await Otp.deleteMany({ phone: normalizedPhone });

    const token = generateToken(vendor._id, 'vendor');

    await vendor.populate('services', 'serviceName category basePrice duration');

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Your account is pending admin verification.',
      data: {
        vendor: {
          ...vendor.toObject(),
          role: 'vendor'
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
        vendor: {
          ...vendor.toObject(),
          role: 'vendor'
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

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private/Admin
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: { $ne: false } }).populate('services', 'serviceName category').sort({ createdAt: -1 });

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
    const vendor = await Vendor.findById(req.params.id).populate('services', 'serviceName category basePrice duration');

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

    let shouldDeleteOtpPhone = null;
    if (updateData.phone !== undefined) {
      const normalizedInput = normalizePhone(updateData.phone);
      const normalizedCurrent = normalizePhone(vendor.phone);
      if (normalizedInput !== normalizedCurrent) {
        const otpRecord = await Otp.findOne({ phone: normalizedInput, verified: true });
        if (!otpRecord) {
          return res.status(400).json({
            success: false,
            message: 'Mobile number is not verified. Please verify using OTP first.'
          });
        }
        vendor.isPhoneVerified = true;
        shouldDeleteOtpPhone = normalizedInput;
      }
    }

    // Update all allowed fields
    const allowedFields = [
      'name', 'phone', 'alternatePhone', 'gender', 'businessName', 'businessType',
      'registrationNumber', 'gstNumber', 'qualifications',
      'experience', 'specialization', 'address', 'city', 'state', 'pincode',
      'longitude', 'latitude',
      'serviceAreas', 'documents', 'availability', 'pricing', 'profileImage',
      'bio', 'bankDetails', 'services'
    ];

    let servicesChanged = false;
    let oldServices = [];
    let newServices = [];

    if (updateData.services !== undefined) {
      newServices = Array.isArray(updateData.services) ? updateData.services.map(s => s.toString()) : (updateData.services ? [updateData.services.toString()] : []);
      oldServices = vendor.services.map(s => s.toString());
      servicesChanged = JSON.stringify(newServices.sort()) !== JSON.stringify(oldServices.sort());
    }

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'services') {
          vendor.services = newServices;
        } else {
          vendor[field] = updateData[field];
        }
      }
    });

    await vendor.save();

    if (shouldDeleteOtpPhone) {
      await Otp.deleteMany({ phone: shouldDeleteOtpPhone });
    }

    if (servicesChanged) {
      const servicesToRemove = oldServices.filter(s => !newServices.includes(s));
      const servicesToAdd = newServices.filter(s => !oldServices.includes(s));

      if (servicesToRemove.length > 0) {
        await Service.updateMany({ _id: { $in: servicesToRemove } }, { $pull: { vendors: vendor._id } });
      }
      if (servicesToAdd.length > 0) {
        await Service.updateMany({ _id: { $in: servicesToAdd } }, { $addToSet: { vendors: vendor._id } });
      }
    }

    await vendor.populate('services', 'serviceName category basePrice duration');

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

    // Credit Ambassador if referred
    const { creditAmbassadorForVendor } = await import('./ambassadorController.js');
    await creditAmbassadorForVendor(vendor);

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

    // Pull vendor ID from all associated services' vendors arrays
    await Service.updateMany({ vendors: vendor._id }, { $pull: { vendors: vendor._id } });

    // Soft delete: set isActive to false instead of deleting
    vendor.isActive = false;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Vendor deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create vendor by admin
// @route   POST /api/vendors/admin/create
// @access  Private/Admin
export const createVendorByAdmin = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      // Basic Information
      name,
      email,
      password,
      phone,
      alternatePhone,
      gender,

      // Business Information
      businessName,
      businessType,
      registrationNumber,
      gstNumber,

      // Professional Details
      qualifications,
      experience,
      specialization,

      // Location Details
      address,
      city,
      state,
      pincode,
      longitude,
      latitude,
      serviceAreas,

      // Documents
      documents,

      // Availability
      availability,

      // Pricing
      pricing,

      // Profile
      profileImage,
      bio,

      // Bank Details
      bankDetails,

      // Selected Services
      services,

      // Status (admin can set these)
      isActive,
      isVerified,
      verificationStatus
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const otpRecord = await Otp.findOne({ phone: normalizedPhone, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is not verified. Please verify using OTP first.'
      });
    }

    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Business name and type are required'
      });
    }

    if (!address || !city || !state || !pincode || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Complete address information including latitude and longitude is required'
      });
    }

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {

      return res.status(400).json({
        success: false,
        message: 'Vendor already exists with this email'
      });

    }

    const finalServices = Array.isArray(services) ? services : (services ? [services] : []);

    // Create vendor with all provided data (admin can set isActive and isVerified)
    const vendor = await Vendor.create({
      // Basic Information
      name,
      email,
      password,
      phone,
      isPhoneVerified: true,
      alternatePhone,
      gender,

      // Business Information
      businessName,
      businessType,
      registrationNumber,
      gstNumber,

      // Professional Details
      qualifications: qualifications || [],
      experience: experience || 0,
      specialization,

      // Location Details
      address,
      city,
      state,
      pincode,
      longitude: Number(longitude),
      latitude: Number(latitude),
      serviceAreas: serviceAreas || [],

      // Documents
      documents,

      // Availability
      availability,

      // Pricing
      pricing,

      // Profile
      profileImage,
      bio,

      // Bank Details
      bankDetails,

      services: finalServices,

      // Status (admin can control these)
      isActive: isActive !== undefined ? isActive : true,
      isVerified: isVerified !== undefined ? isVerified : false,
      verificationStatus: verificationStatus || 'pending'
    });

    // Bidirectional sync: add this vendor to the selected services
    if (finalServices.length > 0) {
      await Service.updateMany({ _id: { $in: finalServices } }, { $addToSet: { vendors: vendor._id } });
    }

    await vendor.populate('services', 'serviceName category basePrice duration');

    await Otp.deleteMany({ phone: normalizedPhone });

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor by admin
// @route   PUT /api/vendors/:id
// @access  Private/Admin
export const updateVendorByAdmin = async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      // Basic Information
      name,
      email,
      phone,
      alternatePhone,
      gender,

      // Business Information
      businessName,
      businessType,
      registrationNumber,
      gstNumber,

      // Professional Details
      qualifications,
      experience,
      specialization,

      // Location Details
      address,
      city,
      state,
      pincode,
      longitude,
      latitude,
      serviceAreas,

      // Documents
      documents,

      // Availability
      availability,

      // Pricing
      pricing,

      // Profile
      profileImage,
      bio,

      // Bank Details
      bankDetails,

      // Selected Services
      services,

      // Status
      isActive,
      isVerified,
      verificationStatus
    } = req.body;

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    let shouldDeleteOtpPhone = null;
    if (phone !== undefined) {
      const normalizedInput = normalizePhone(phone);
      const normalizedCurrent = normalizePhone(vendor.phone);
      if (normalizedInput !== normalizedCurrent) {
        const otpRecord = await Otp.findOne({ phone: normalizedInput, verified: true });
        if (!otpRecord) {
          return res.status(400).json({
            success: false,
            message: 'Mobile number is not verified. Please verify using OTP first.'
          });
        }
        vendor.isPhoneVerified = true;
        shouldDeleteOtpPhone = normalizedInput;
      }
    }

    let servicesChanged = false;
    let oldServices = [];
    let newServices = [];

    if (services !== undefined) {
      newServices = Array.isArray(services) ? services.map(s => s.toString()) : (services ? [services.toString()] : []);
      oldServices = vendor.services.map(s => s.toString());
      servicesChanged = JSON.stringify(newServices.sort()) !== JSON.stringify(oldServices.sort());
    }

    // Update fields only if provided
    if (name !== undefined) vendor.name = name;
    if (email !== undefined) vendor.email = email;
    if (phone !== undefined) vendor.phone = phone;
    if (alternatePhone !== undefined) vendor.alternatePhone = alternatePhone;
    if (gender !== undefined) vendor.gender = gender;

    if (businessName !== undefined) vendor.businessName = businessName;
    if (businessType !== undefined) vendor.businessType = businessType;
    if (registrationNumber !== undefined) vendor.registrationNumber = registrationNumber;
    if (gstNumber !== undefined) vendor.gstNumber = gstNumber;

    if (qualifications !== undefined) vendor.qualifications = qualifications;
    if (experience !== undefined) vendor.experience = experience;
    if (specialization !== undefined) vendor.specialization = specialization;

    if (address !== undefined) vendor.address = address;
    if (city !== undefined) vendor.city = city;
    if (state !== undefined) vendor.state = state;
    if (pincode !== undefined) vendor.pincode = pincode;
    if (longitude !== undefined) vendor.longitude = Number(longitude);
    if (latitude !== undefined) vendor.latitude = Number(latitude);
    if (serviceAreas !== undefined) vendor.serviceAreas = serviceAreas;

    if (documents !== undefined) vendor.documents = documents;
    if (availability !== undefined) vendor.availability = availability;
    if (pricing !== undefined) vendor.pricing = pricing;

    if (profileImage !== undefined) vendor.profileImage = profileImage;
    if (bio !== undefined) vendor.bio = bio;

    if (bankDetails !== undefined) vendor.bankDetails = bankDetails;
    if (services !== undefined) vendor.services = newServices;

    if (isActive !== undefined) vendor.isActive = isActive;
    if (isVerified !== undefined) vendor.isVerified = isVerified;
    if (verificationStatus !== undefined) vendor.verificationStatus = verificationStatus;

    if (vendor.isVerified || vendor.verificationStatus === 'verified') {
      const { creditAmbassadorForVendor } = await import('./ambassadorController.js');
      await creditAmbassadorForVendor(vendor);
    }

    await vendor.save();

    if (shouldDeleteOtpPhone) {
      await Otp.deleteMany({ phone: shouldDeleteOtpPhone });
    }

    if (servicesChanged) {
      const servicesToRemove = oldServices.filter(s => !newServices.includes(s));
      const servicesToAdd = newServices.filter(s => !oldServices.includes(s));

      if (servicesToRemove.length > 0) {
        await Service.updateMany({ _id: { $in: servicesToRemove } }, { $pull: { vendors: vendor._id } });
      }
      if (servicesToAdd.length > 0) {
        await Service.updateMany({ _id: { $in: servicesToAdd } }, { $addToSet: { vendors: vendor._id } });
      }
    }

    await vendor.populate('services', 'serviceName category basePrice duration');

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendors with pagination and search (Admin)
// @route   GET /api/vendors/admin/paginated
// @access  Private/Admin
export const getAllVendorsByPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { isActive: { $ne: false } };

    if (search) {
      query.$or = [
        { vendorId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const totalVendors = await Vendor.countDocuments(query);
    const totalPages = Math.ceil(totalVendors / limitNum);

    const vendors = await Vendor.find(query)
      .populate('services', 'serviceName category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: vendors.length,
      totalVendors,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload vendor document/image
// @route   POST /api/vendors/upload
// @access  Public
export const uploadVendorFile = async (req, res) => {
  try {
    if (!req.files || (!req.files.file && !req.files.image)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const uploadedFile = req.files.file || req.files.image;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, GIF, and PDF are allowed'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(uploadedFile.tempFilePath, {
      folder: 'vendor_documents',
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
    console.error('Vendor upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
};

// @desc    Verify vendor document
// @route   PUT /api/vendors/:id/verify-document
// @access  Private/Admin
export const verifyVendorDocument = async (req, res) => {
  try {
    const { documentKey, status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const docKeys = ['identityProof', 'qualificationCertificate', 'businessLicense', 'insuranceCertificate', 'policeVerification'];
    if (!docKeys.includes(documentKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document key'
      });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (!vendor.documents) {
      vendor.documents = {};
    }
    if (!vendor.documents[documentKey]) {
      vendor.documents[documentKey] = { type: documentKey, url: '' };
    }

    // Set values
    vendor.documents[documentKey].status = status;
    if (status === 'rejected') {
      vendor.documents[documentKey].rejectionReason = rejectionReason || 'Rejected by Admin';
    } else {
      vendor.documents[documentKey].rejectionReason = '';
    }

    // Mark as modified to ensure mongoose saves subdocument changes correctly
    vendor.markModified('documents');
    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Document status has been set to ${status}`,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews for a vendor
// @route   GET /api/vendors/:id/reviews
// @access  Private
export const getVendorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.params.id })
      .populate('userId', 'name email profileImage')
      .populate('bookingId', 'selectedServices preferredTimeSlot bookingStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get ID Card details for a vendor
// @route   GET /api/vendors/:id/id-card
// @access  Private (Vendor or Admin)
export const getVendorIdCardDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;

    // Check if requester is Admin or the Vendor themselves
    const isAdmin = req.user && req.user.role === 'admin';
    const isSelfVendor = req.vendor && req.vendor._id.toString() === vendorId;

    if (!isAdmin && !isSelfVendor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ID card details'
      });
    }

    const vendor = await Vendor.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Retrieve the active admin setting containing logo and signature
    const activeSetting = await AdminSetting.findOne({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        vendor,
        setting: activeSetting || {
          title: "General Medical Services",
          logoUrl: null,
          signatureUrl: null
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getReferralStats = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Get referred users
    const referredUsers = await User.find({
      referredByRef: vendorId,
      referredByModel: 'Vendor'
    }).select('patientId name email phone createdAt');

    // Get referred vendors
    const referredVendors = await Vendor.find({
      referredByRef: vendorId,
      referredByModel: 'Vendor'
    }).select('vendorId name email phone businessName createdAt');

    // Find who referred this vendor
    let referrerName = null;
    let referrerRole = null;
    if (vendor.referredByRef) {
      if (vendor.referredByModel === 'User') {
        const refUser = await User.findById(vendor.referredByRef).select('name role');
        if (refUser) {
          referrerName = refUser.name;
          referrerRole = refUser.role;
        }
      } else if (vendor.referredByModel === 'Vendor') {
        const refVendor = await Vendor.findById(vendor.referredByRef).select('name role');
        if (refVendor) {
          referrerName = refVendor.name;
          referrerRole = 'vendor';
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        referralCode: vendor.referralCode || null,
        referredBy: vendor.referredBy || null,
        referrerName,
        referrerRole,
        referredUsers,
        referredVendors,
        referredUsersCount: referredUsers.length,
        referredVendorsCount: referredVendors.length
      }
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const generateMyReferralCode = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (vendor.referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code already exists',
        referralCode: vendor.referralCode
      });
    }

    // Generate unique referral code (same logic as pre-save hook)
    let isUnique = false;
    let code = '';
    while (!isUnique) {
      code = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const userMatch = await User.findOne({ referralCode: code });
      const vendorMatch = await Vendor.findOne({ referralCode: code });
      if (!userMatch && !vendorMatch) {
        isUnique = true;
      }
    }

    vendor.referralCode = code;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Referral code generated successfully',
      referralCode: code
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

