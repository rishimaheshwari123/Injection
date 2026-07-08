import Booking from '../models/Booking.js';
import Coupon from '../models/Coupon.js';
import { sendToUser, sendToVendor } from './notificationController.js';

// Helper function to generate unique coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BOOK';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private/User
export const createBooking = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      // Patient Information
      patientName,
      age,
      sex,
      address,
      pincode,
      currentLocation,
      alternateMobile,
      email,

      // Selected Services
      selectedServices,

      // Additional Information
      additionalRequirements,

      // Insurance
      hasInsurance,
      insurancePolicyNumber,

      // Pricing
      subtotal,
      gstAmount,
      grandTotal,

      // Preferences
      freeComplimentaryService,
      preferredTimeSlot,
      staffPreference,
      serviceLocation,
      estimatedDuration,

      // Vendor Reference
      vendorId
    } = req.body;

    // Get userId from JWT token. If admin is creating booking, allow using the userId passed in request body if it is a valid ObjectId.
    let userId = req.user._id;
    if (req.user && req.user.role === 'admin' && req.body.userId && /^[0-9a-fA-F]{24}$/.test(req.body.userId)) {
      userId = req.body.userId;
    }

    // Validate required fields
    if (!patientName || !age || !sex || !address || !pincode || !currentLocation || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required patient information'
      });
    }

    if (!selectedServices || selectedServices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one service must be selected'
      });
    }

    if (!preferredTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Preferred time slot is required'
      });
    }

    if (subtotal === undefined || gstAmount === undefined || grandTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Pricing information is required'
      });
    }

    // Create booking with validated data
    const booking = await Booking.create({
      // Patient Information
      patientName,
      age,
      sex,
      address,
      pincode,
      currentLocation,
      alternateMobile,
      email,

      // Selected Services
      selectedServices,

      // Additional Information
      additionalRequirements,

      // Insurance
      hasInsurance: hasInsurance || false,
      insurancePolicyNumber,

      // Pricing
      subtotal,
      gstAmount,
      grandTotal,

      // Preferences
      freeComplimentaryService: freeComplimentaryService || 'None',
      preferredTimeSlot,
      staffPreference: staffPreference || 'Any Available',
      serviceLocation: serviceLocation || 'At Home',
      estimatedDuration: estimatedDuration || 45,

      // References
      userId,
      vendorId: vendorId || null,

      // Status - If a vendor is assigned at creation, mark as accepted, otherwise pending
      bookingStatus: vendorId ? 'accepted' : 'pending',
      acceptedAt: vendorId ? new Date() : null
    });

    // Populate user and vendor details
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    // Auto-create a 10% discount coupon for the user's next booking
    try {
      let couponCode;
      let isUnique = false;

      // Generate unique coupon code
      while (!isUnique) {
        couponCode = generateCouponCode();
        const existingCoupon = await Coupon.findOne({ code: couponCode });
        if (!existingCoupon) {
          isUnique = true;
        }
      }

      // Set expiry date to 30 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const newCoupon = await Coupon.create({
        name: `Booking Reward - ${booking.patientName}`,
        code: couponCode,
        description: `10% discount coupon for your next booking. Valid for 30 days.`,
        discountType: 'percentage',
        discountValue: 10,
        isActive: true,
        userId: userId,
        bookingId: booking._id,
        isUsed: false,
        expiresAt: expiryDate
      });

      console.log(`Auto-created coupon ${couponCode} for user ${userId}`);
    } catch (couponError) {
      console.error('Error creating auto-coupon:', couponError);
      // Don't fail the booking if coupon creation fails
    }

    // Send push notification for Admin-created booking
    if (req.user && req.user.role === 'admin') {
      sendToUser(userId, {
        title: 'New Booking Created',
        body: `A new booking has been created for you by Admin. Booking ID: ${booking._id}`,
        data: { bookingId: booking._id.toString(), type: 'admin_booking' }
      });

      if (booking.vendorId) {
        sendToVendor(booking.vendorId, {
          title: 'Booking Assigned',
          body: `A new booking has been assigned to you by Admin. Booking ID: ${booking._id}`,
          data: { bookingId: booking._id.toString(), type: 'admin_booking_assigned' }
        });
      }
    }

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
    const queryUserId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user._id;

    const bookings = await Booking.find({ userId: queryUserId })
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





// @desc    Get vendor's accepted bookings
// @route   GET /api/bookings/vendor/me
// @access  Private/Vendor
export const getVendorAllBookings = async (req, res) => {
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

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private/User/Admin
export const rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be rescheduled
    if (booking.bookingStatus === 'completed' || booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule completed or cancelled booking'
      });
    }

    // Store old time slot for history
    const oldTimeSlot = booking.preferredTimeSlot;

    // Update time slot
    booking.preferredTimeSlot = `${newDate} ${newTime}`;
    booking.rescheduledAt = new Date();
    booking.rescheduleReason = reason || 'Rescheduled by user';

    // Add note about reschedule
    booking.notes.push({
      text: `Booking rescheduled from "${oldTimeSlot}" to "${booking.preferredTimeSlot}". Reason: ${reason || 'Not specified'}`,
      addedBy: req.user?.name || 'Admin',
      addedAt: new Date()
    });

    await booking.save();

    // Populate and return updated booking
    await booking.populate('userId', 'name email phone');
    await booking.populate('vendorId', 'name businessName phone email');

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
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
    const { status, date, page = 1, limit = 10, search, prescriptionStatus, reportStatus, vendorId, userId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (userId) {
      query.userId = userId;
    }

    if (vendorId) {
      query.vendorId = vendorId;
    }

    if (status) {
      query.bookingStatus = status;
    }

    if (prescriptionStatus === 'with') {
      query['prescriptions.0'] = { $exists: true };
    } else if (prescriptionStatus === 'without') {
      query.$or = [
        { prescriptions: { $exists: false } },
        { prescriptions: { $size: 0 } }
      ];
    }

    if (reportStatus === 'with') {
      query.$or = [
        { 'reports.0': { $exists: true } },
        { reportUrl: { $ne: null, $exists: true } }
      ];
    } else if (reportStatus === 'without') {
      query.$and = [
        { $or: [{ reports: { $exists: false } }, { reports: { $size: 0 } }] },
        { $or: [{ reportUrl: { $exists: false } }, { reportUrl: null }, { reportUrl: '' }] }
      ];
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { alternateMobile: { $regex: search, $options: 'i' } }
      ];
    }

    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limitNum);

    const totalOverallBookings = await Booking.countDocuments({});
    const totalOverallWithPrescriptions = await Booking.countDocuments({ 'prescriptions.0': { $exists: true } });
    const totalOverallWithoutPrescriptions = await Booking.countDocuments({
      $or: [
        { prescriptions: { $exists: false } },
        { prescriptions: { $size: 0 } }
      ]
    });

    const totalOverallWithReports = await Booking.countDocuments({
      $or: [
        { 'reports.0': { $exists: true } },
        { reportUrl: { $ne: null, $exists: true } }
      ]
    });

    const totalOverallWithoutReports = await Booking.countDocuments({
      $and: [
        { $or: [{ reports: { $exists: false } }, { reports: { $size: 0 } }] },
        { $or: [{ reportUrl: { $exists: false } }, { reportUrl: null }, { reportUrl: '' }] }
      ]
    });

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'name phone businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalBookings,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      stats: {
        totalBookings: totalOverallBookings,
        withPrescription: totalOverallWithPrescriptions,
        withoutPrescription: totalOverallWithoutPrescriptions,
        withReport: totalOverallWithReports,
        withoutReport: totalOverallWithoutReports
      },
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


// @desc    Add note to booking
// @route   POST /api/bookings/:id/notes
// @access  Private/Admin
export const addNoteToBooking = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Add new note
    booking.notes.push({
      text: text.trim(),
      addedBy: req.user?.name || 'Admin',
      addedAt: new Date()
    });

    await booking.save();

    // Populate and return updated booking
    await booking.populate('userId', 'name email phone');
    await booking.populate('vendorId', 'name businessName phone email');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add prescription to booking
// @route   POST /api/bookings/:id/prescription
// @access  Private/Admin
export const addPrescription = async (req, res) => {
  try {
    const { prescriptionData, prescriptionType } = req.body;

    if (!prescriptionData || !prescriptionType) {
      return res.status(400).json({
        success: false,
        message: 'Prescription data and type are required'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create new prescription object
    const newPrescription = {
      type: prescriptionType,
      addedBy: req.user?.name || 'Admin',
      addedAt: new Date()
    };

    // Add fields based on type
    if (prescriptionType === 'form') {
      Object.assign(newPrescription, {
        doctorName: prescriptionData.doctorName || '',
        doctorRegistration: prescriptionData.doctorRegistration || '',
        hospitalName: prescriptionData.hospitalName || '',
        patientComplaints: prescriptionData.patientComplaints || '',
        diagnosis: prescriptionData.diagnosis || '',
        medications: prescriptionData.medications || [],
        labTests: prescriptionData.labTests || '',
        specialInstructions: prescriptionData.specialInstructions || '',
        followUpDate: prescriptionData.followUpDate || null,
        imageUrl: null,
        supportingImageUrl: prescriptionData.supportingImageUrl || null
      });
    } else if (prescriptionType === 'image') {
      Object.assign(newPrescription, {
        imageUrl: prescriptionData.imageUrl || '',
        supportingImageUrl: null
      });
    }

    // Add to prescriptions array
    booking.prescriptions.push(newPrescription);
    await booking.save();

    // Populate and return updated booking
    await booking.populate('userId', 'name email phone');
    await booking.populate('vendorId', 'name businessName phone email');

    res.status(200).json({
      success: true,
      message: 'Prescription added successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update prescription for booking (Legacy - now adds to array)
// @route   PUT /api/bookings/:id/prescription
// @access  Private/Admin
export const updatePrescription = async (req, res) => {
  // Just call addPrescription for backward compatibility
  return addPrescription(req, res);
};

// @desc    Update prescription summary for booking (Admin)
// @route   PUT /api/bookings/:id/prescription-summary
// @access  Private/Admin
export const updatePrescriptionSummary = async (req, res) => {
  try {
    const { summary } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.prescriptionSummary = summary;
    await booking.save();

    // Populate user and vendor details before returning
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    res.status(200).json({
      success: true,
      message: 'Prescription summary updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
