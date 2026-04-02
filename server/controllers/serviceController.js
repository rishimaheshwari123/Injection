import Service from '../models/Service.js';

// @desc    Create new service (Admin)
// @route   POST /api/services/admin/create
// @access  Private/Admin
export const adminCreateService = async (req, res) => {
  try {
    const serviceData = req.body;

    // Validate vendorId is provided
    if (!serviceData.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    // Create service
    const service = await Service.create(serviceData);

    // Populate vendor details
    await service.populate('vendorId', 'name businessName phone email');

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
    const serviceData = req.body;

    // Get vendorId from JWT token
    const vendorId = req.vendor._id;

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

    // Create service
    const service = await Service.create({
      ...serviceData,
      vendorId
    });

    // Populate vendor details
    await service.populate('vendorId', 'name businessName phone email');

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
      query.vendorId = vendorId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query)
      .populate({
        path: 'vendorId',
        select: 'name businessName phone email city state rating isActive isVerified verificationStatus'
      })
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
    const { category, vendorId, isActive } = req.query;
    
    let query = { isActive: true }; // Only show active services by default
    
    if (category) {
      query.category = category;
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query)
      .populate({
        path: 'vendorId',
        match: { isActive: true, isVerified: true, verificationStatus: 'verified' }, // Only verified vendors
        select: 'name businessName phone email city state rating'
      })
      .sort({ createdAt: -1 });

    // Filter out services where vendor is null (not verified)
    const filteredServices = services.filter(service => service.vendorId !== null);

    res.status(200).json({
      success: true,
      count: filteredServices.length,
      data: filteredServices
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
      .populate('vendorId', 'name businessName phone email address city state pincode rating totalReviews');

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
    const services = await Service.find({ vendorId: req.vendor._id })
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
      vendorId: req.params.vendorId,
      isActive: true 
    })
      .populate('vendorId', 'name businessName phone email')
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
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name businessName phone email city state rating isActive isVerified verificationStatus');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
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
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if vendor owns this service
    if (service.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
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
    if (service.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

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
    if (service.vendorId.toString() !== req.vendor._id.toString()) {
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
    const services = await Service.find({ 
      category: req.params.category,
      isActive: true 
    })
      .populate('vendorId', 'name businessName phone email city state rating')
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
