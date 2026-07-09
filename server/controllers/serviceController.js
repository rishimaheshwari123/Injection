import mongoose from 'mongoose';
import Service from '../models/Service.js';
import Vendor from '../models/Vendor.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload service image
// @route   POST /api/services/upload-image
// @access  Private/Admin
export const uploadServiceImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const file = req.files.image;

    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size should be less than 5MB'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'services',
      resource_type: 'image'
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

// @desc    Create new service (Admin)
// @route   POST /api/services/admin/create
// @access  Private/Admin
export const adminCreateService = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      serviceName,
      description,
      category,
      basePrice,
      duration,
      serviceType,
      vendors,
      isActive,
      icon,
      image,
      tags,
      requirements
    } = req.body;

    // Validate required fields
    if (!serviceName || !description || !category || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Service name, description, category, and base price are required'
      });
    }

    const finalVendors = Array.isArray(vendors) ? vendors : (vendors ? [vendors] : []);

    // Validate category
    const Category = (await import('../models/Category.js')).default;
    let targetCategory = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      targetCategory = await Category.findById(category);
    } else {
      targetCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    }

    if (!targetCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    const finalCategory = targetCategory._id;

    // Validate base price
    if (basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    // Create service with validated data
    const service = await Service.create({
      serviceName,
      description,
      category: finalCategory,
      basePrice,
      duration: duration || 45,
      serviceType: serviceType || 'At Home',
      vendors: finalVendors,
      isActive: isActive !== undefined ? isActive : true,
      icon: icon || null,
      image: image || null,
      tags: tags || [],
      requirements
    });

    // Update vendors' services arrays
    if (finalVendors.length > 0) {
      await Vendor.updateMany({ _id: { $in: finalVendors } }, { $addToSet: { services: service._id } });
    }

    // Populate vendor details
    await service.populate('vendors', 'name businessName phone email');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new service
// @route   POST /api/services/create
// @access  Private/Vendor
export const createService = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      serviceName,
      description,
      category,
      basePrice,
      duration,
      serviceType,
      vendors,
      isActive,
      icon,
      image,
      tags,
      requirements
    } = req.body;

    // Use vendors from req.body if provided, otherwise from JWT token
    const finalVendors = Array.isArray(vendors) && vendors.length > 0 ? vendors : [req.vendor._id];

    // Check if vendor is verified and active
    if (!req.vendor.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please wait for admin verification.'
      });
    }

    if (!req.vendor.isVerified || req.vendor.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. Please wait for admin verification.'
      });
    }

    // Validate required fields
    if (!serviceName || !description || !category || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Service name, description, category, and base price are required'
      });
    }

    // Validate category
    const Category = (await import('../models/Category.js')).default;
    let targetCategory = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      targetCategory = await Category.findById(category);
    } else {
      targetCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    }

    if (!targetCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    const finalCategory = targetCategory._id;

    // Validate base price
    if (basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    // Create service with validated data
    const service = await Service.create({
      serviceName,
      description,
      category: finalCategory,
      basePrice,
      duration: duration || 45,
      serviceType: serviceType || 'At Home',
      vendors: finalVendors,
      isActive: isActive !== undefined ? isActive : true,
      icon: icon || null,
      image: image || null,
      tags: tags || [],
      requirements
    });

    // Update vendors' services arrays
    if (finalVendors.length > 0) {
      await Vendor.updateMany({ _id: { $in: finalVendors } }, { $addToSet: { services: service._id } });
    }

    // Populate vendor details
    await service.populate('vendors', 'name businessName phone email');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all services (Admin - shows all services regardless of vendor status)
// @route   GET /api/services/admin/all
// @access  Private/Admin
export const adminGetAllServices = async (req, res) => {
  try {
    const { category, vendorId, isActive } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (vendorId) {
      query.vendors = vendorId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query)
      .populate({
        path: 'vendors',
        select: 'name businessName phone email city state rating isActive isVerified verificationStatus'
      })
      .populate('category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('vendors', 'name businessName phone email rating')
      .populate('category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('vendors', 'name businessName phone email address city state pincode rating totalReviews')
      .populate('category');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor's all services
// @route   GET /api/services/vendor/me
// @access  Private/Vendor
export const getVendorServices = async (req, res) => {
  try {
    const services = await Service.find({ vendors: req.vendor._id })
      .populate('category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get services by vendor ID
// @route   GET /api/services/vendor/:vendorId
// @access  Public
export const getServicesByVendorId = async (req, res) => {
  try {
    const services = await Service.find({
      vendors: req.params.vendorId,
      isActive: true
    })
      .populate('vendors', 'name businessName phone email')
      .populate('category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service (Admin)
// @route   PUT /api/services/admin/:id
// @access  Private/Admin
export const adminUpdateService = async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      serviceName,
      description,
      category,
      basePrice,
      duration,
      serviceType,
      vendors,
      isActive,
      icon,
      image,
      tags,
      requirements
    } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    let vendorsChanged = false;
    let oldVendors = [];
    let newVendors = [];

    if (vendors !== undefined) {
      newVendors = Array.isArray(vendors) ? vendors.map(v => v.toString()) : (vendors ? [vendors.toString()] : []);
      oldVendors = service.vendors.map(v => v.toString());
      vendorsChanged = JSON.stringify(newVendors.sort()) !== JSON.stringify(oldVendors.sort());
    }

    // Validate category if provided
    let finalCategory = undefined;
    if (category !== undefined) {
      const Category = (await import('../models/Category.js')).default;
      let targetCategory = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        targetCategory = await Category.findById(category);
      } else {
        targetCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }

      if (!targetCategory) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      finalCategory = targetCategory._id;
    }


    // Validate base price if provided
    if (basePrice !== undefined && basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    // Update fields only if provided
    if (serviceName !== undefined) service.serviceName = serviceName;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = finalCategory;
    if (basePrice !== undefined) service.basePrice = basePrice;
    if (duration !== undefined) service.duration = duration;
    if (serviceType !== undefined) service.serviceType = serviceType;
    if (vendors !== undefined) service.vendors = newVendors;
    if (isActive !== undefined) service.isActive = isActive;
    if (icon !== undefined) service.icon = icon;
    if (image !== undefined) service.image = image;
    if (tags !== undefined) service.tags = tags;
    if (requirements !== undefined) service.requirements = requirements;

    await service.save();

    if (vendorsChanged) {
      const vendorsToRemove = oldVendors.filter(v => !newVendors.includes(v));
      const vendorsToAdd = newVendors.filter(v => !oldVendors.includes(v));

      if (vendorsToRemove.length > 0) {
        await Vendor.updateMany({ _id: { $in: vendorsToRemove } }, { $pull: { services: service._id } });
      }
      if (vendorsToAdd.length > 0) {
        await Vendor.updateMany({ _id: { $in: vendorsToAdd } }, { $addToSet: { services: service._id } });
      }
    }

    await service.populate('vendors', 'name businessName phone email city state rating isActive isVerified verificationStatus');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Vendor
export const updateService = async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      serviceName,
      description,
      category,
      basePrice,
      duration,
      serviceType,
      isActive,
      icon,
      image,
      tags,
      requirements
    } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service
    if (!service.vendors.map(v => v.toString()).includes(req.vendor._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Validate category if provided
    let finalCategory = undefined;
    if (category !== undefined) {
      const Category = (await import('../models/Category.js')).default;
      let targetCategory = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        targetCategory = await Category.findById(category);
      } else {
        targetCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }

      if (!targetCategory) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
      finalCategory = targetCategory._id;
    }


    // Validate base price if provided
    if (basePrice !== undefined && basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price cannot be negative'
      });
    }

    // Update fields only if provided
    if (serviceName !== undefined) service.serviceName = serviceName;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = finalCategory;
    if (basePrice !== undefined) service.basePrice = basePrice;
    if (duration !== undefined) service.duration = duration;
    if (serviceType !== undefined) service.serviceType = serviceType;
    if (isActive !== undefined) service.isActive = isActive;
    if (icon !== undefined) service.icon = icon;
    if (image !== undefined) service.image = image;
    if (tags !== undefined) service.tags = tags;
    if (requirements !== undefined) service.requirements = requirements;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Vendor
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service
    if (!service.vendors.map(v => v.toString()).includes(req.vendor._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await Vendor.updateMany({ _id: { $in: service.vendors } }, { $pull: { services: service._id } });
    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle service active status
// @route   PUT /api/services/:id/toggle-status
// @access  Private/Vendor
export const toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service
    if (!service.vendors.map(v => v.toString()).includes(req.vendor._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
export const getServicesByCategory = async (req, res) => {
  try {
    const Category = (await import('../models/Category.js')).default;
    let categoryQuery = req.params.category;
    if (!mongoose.Types.ObjectId.isValid(categoryQuery)) {
      const cat = await Category.findOne({ name: { $regex: new RegExp(`^${categoryQuery}$`, 'i') } });
      if (cat) {
        categoryQuery = cat._id;
      }
    }

    const services = await Service.find({
      category: categoryQuery,
      isActive: true
    })
      .populate('vendors', 'name businessName phone email city state rating')
      .populate('category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all services with pagination and search (Admin)
// @route   GET /api/services/admin/paginated
// @access  Private/Admin
export const adminGetAllServicesByPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (search) {
      const Category = (await import('../models/Category.js')).default;
      const Vendor = (await import('../models/Vendor.js')).default;

      // Find matching categories by name
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: 'i' }
      });
      const categoryIds = matchingCategories.map(c => c._id);

      // Find matching vendors
      const matchingVendors = await Vendor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } }
        ]
      });
      const vendorIds = matchingVendors.map(v => v._id);

      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { category: { $in: categoryIds } },
        { vendors: { $in: vendorIds } }
      ];
    }

    const totalServices = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalServices / limitNum);

    const services = await Service.find(query)
      .populate({
        path: 'vendors',
        select: 'name businessName phone email city state rating isActive isVerified verificationStatus'
      })
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: services.length,
      totalServices,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

