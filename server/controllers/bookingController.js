import Booking from '../models/Booking.js';

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private/User
export const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;

    // Get userId from JWT token
    const userId = req.user._id;

    // Create booking
    const booking = await Booking.create({
      ...bookingData,
      userId,
      vendorId: null,
      bookingStatus: 'pending'
    });

    // Populate user details
    await booking.populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's all bookings
// @route   GET /api/bookings/user/me
// @access  Private/User
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('vendorId', 'name phone businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('vendorId', 'name phone businessName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all available bookings (pending) for vendor's services
// @route   GET /api/bookings/available
// @access  Private/Vendor
export const getAvailableBookings = async (req, res) => {
  try {
    // First, get all services created by this vendor
    const Service = (await import('../models/Service.js')).default;
    const vendorServices = await Service.find({ vendorId: req.vendor._id }).select('_id');
    const serviceIds = vendorServices.map(service => service._id);

    // Find bookings that have vendor's services and are pending
    const bookings = await Booking.find({ 
      bookingStatus: 'pending',
      vendorId: null,
      'selectedServices.serviceId': { $in: serviceIds }
    })
      .populate('userId', 'name phone')
      .populate('selectedServices.serviceId', 'serviceName category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Vendor accepts booking
// @route   PUT /api/bookings/:id/accept
// @access  Private/Vendor
export const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is still pending
    if (booking.bookingStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking is not available for acceptance'
      });
    }

    // Check if already accepted by another vendor
    if (booking.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Booking already accepted by another vendor'
      });
    }

    // Accept booking
    booking.vendorId = req.vendor._id;
    booking.bookingStatus = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    await booking.populate('userId', 'name email phone');
    await booking.populate('vendorId', 'name phone businessName');

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor's accepted bookings
// @route   GET /api/bookings/vendor/me
// @access  Private/Vendor
export const getVendorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.vendor._id })
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start service (vendor)
// @route   PUT /api/bookings/:id/start
// @access  Private/Vendor
export const startService = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if vendor owns this booking
    if (booking.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Check if booking is accepted
    if (booking.bookingStatus !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be accepted before starting service'
      });
    }

    booking.bookingStatus = 'in-progress';
    booking.startedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Service started successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete service (vendor)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Vendor
export const completeService = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if vendor owns this booking
    if (booking.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Check if booking is in-progress
    if (booking.bookingStatus !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Service must be in-progress before completing'
      });
    }

    booking.bookingStatus = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Service completed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking (user)
// @route   PUT /api/bookings/:id/cancel
// @access  Private/User
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

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
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'User cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/all
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = {};
    
    if (status) {
      query.bookingStatus = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'name phone businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.bookingStatus = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete booking (Admin)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
