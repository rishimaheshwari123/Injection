import VendorServiceRequest from '../models/VendorServiceRequest.js';
import Service from '../models/Service.js';
import Vendor from '../models/Vendor.js';
import mongoose from 'mongoose';

// @desc    Create a new service request by vendor
// @route   POST /api/vendor-service-requests
// @access  Private/Vendor
export const createServiceRequest = async (req, res) => {
  try {
    const { services, vendorId } = req.body;

    let targetVendorId;
    if (req.vendor) {
      targetVendorId = req.vendor._id;
    } else if (req.user && req.user.role === 'admin') {
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required when request is created by admin'
        });
      }
      targetVendorId = vendorId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate services input
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one service ID'
      });
    }

    // Validate each ID is a valid ObjectId
    for (const serviceId of services) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid service ID: ${serviceId}`
        });
      }
    }

    // Check if services exist and are active
    const existingServices = await Service.find({
      _id: { $in: services },
      isActive: true
    });

    if (existingServices.length !== services.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected services are invalid or inactive'
      });
    }

    // Check if vendor already has a pending service request
    const pendingRequest = await VendorServiceRequest.findOne({
      vendor: targetVendorId,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'This vendor already has a pending request. Please wait for it to be processed.'
      });
    }

    // Check if vendor already has all of these services assigned
    const vendor = await Vendor.findById(targetVendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    const assignedServiceIds = vendor.services.map(s => s.toString());
    const allAlreadyAssigned = services.every(sId => assignedServiceIds.includes(sId));

    if (allAlreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'All of the requested services are already assigned to this vendor'
      });
    }

    // Create request
    const newRequest = await VendorServiceRequest.create({
      vendor: targetVendorId,
      services,
      status: 'pending'
    });

    const populatedRequest = await newRequest.populate('services', 'serviceName category basePrice duration');

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully.',
      data: populatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get logged-in vendor's service requests
// @route   GET /api/vendor-service-requests/my-requests
// @access  Private/Vendor
export const getMyServiceRequests = async (req, res) => {
  try {
    const requests = await VendorServiceRequest.find({ vendor: req.vendor._id })
      .populate('services', 'serviceName category basePrice duration')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all service requests (Admin Only)
// @route   GET /api/vendor-service-requests
// @access  Private/Admin
export const getAllServiceRequests = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    let query = {};

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter'
        });
      }
      query.status = status;
    }

    if (vendor) {
      query.vendor = vendor;
    }

    const requests = await VendorServiceRequest.find(query)
      .populate('vendor', 'name businessName email phone vendorId')
      .populate('services', 'serviceName category basePrice duration')
      .populate('processedBy', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get service request by ID
// @route   GET /api/vendor-service-requests/:id
// @access  Private (Vendor owner or Admin)
export const getRequestById = async (req, res) => {
  try {
    const request = await VendorServiceRequest.findById(req.params.id)
      .populate('vendor', 'name businessName email phone')
      .populate('services', 'serviceName category basePrice duration')
      .populate('processedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Access control: Admin can access, or the requesting vendor can access
    const isVendor = req.vendor && req.vendor._id.toString() === request.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this service request'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve or Reject a service request (Admin Only)
// @route   PUT /api/vendor-service-requests/:id/process
// @access  Private/Admin
export const processServiceRequest = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: approved or rejected'
      });
    }

    const request = await VendorServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been processed and is currently ${request.status}`
      });
    }

    if (status === 'approved') {
      // 1. Update the vendor with these services
      await Vendor.findByIdAndUpdate(
        request.vendor,
        { $addToSet: { services: { $each: request.services } } },
        { new: true }
      );

      // 2. Update each of the services with this vendor
      await Service.updateMany(
        { _id: { $in: request.services } },
        { $addToSet: { vendors: request.vendor } }
      );
    }

    // Update request state
    request.status = status;
    if (adminRemarks !== undefined) {
      request.adminRemarks = adminRemarks;
    }
    request.processedAt = new Date();
    request.processedBy = req.user._id;

    await request.save();

    const updatedRequest = await VendorServiceRequest.findById(request._id)
      .populate('vendor', 'name businessName email phone services')
      .populate('services', 'serviceName category')
      .populate('processedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Service request successfully ${status}`,
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
