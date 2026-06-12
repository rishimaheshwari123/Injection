import Vendor from '../models/Vendor.js';
import Service from '../models/Service.js';
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
      services
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Business name and type are required'
      });
    }

    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete address information is required'
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
      verificationStatus: 'pending'
    });

    // Bidirectional sync: add this vendor to the selected services
    if (finalServices.length > 0) {
      await Service.updateMany({ _id: { $in: finalServices } }, { $addToSet: { vendors: vendor._id } });
    }

    const token = generateToken(vendor._id, 'vendor');

    await vendor.populate('services', 'serviceName category basePrice duration');

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
    const vendors = await Vendor.find().populate('services', 'serviceName category').sort({ createdAt: -1 });

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

    // Update all allowed fields
    const allowedFields = [
      'name', 'phone', 'alternatePhone', 'gender', 'businessName', 'businessType',
      'registrationNumber', 'gstNumber', 'qualifications',
      'experience', 'specialization', 'address', 'city', 'state', 'pincode',
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

    if (!businessName || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Business name and type are required'
      });
    }

    if (!address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete address information is required'
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

    await vendor.save();

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

    let query = {};

    if (search) {
      query.$or = [
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
