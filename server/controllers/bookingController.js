import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';
import UserReview from '../models/UserReview.js';
import Counter from '../models/Counter.js';
import { sendToUser, sendToVendor } from './notificationController.js';

// Helper function to generate unique booking ID
const getNextBookingId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: 'bookingId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  // Format: BK000001, BK000002, etc.
  return `BK${String(counter.seq).padStart(6, '0')}`;
};

// Helper function to generate unique coupon code
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BOOK';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to recalculate booking amount, additional requested items amount, GST, and grand total
const recalculateBookingTotals = (booking) => {
  const additional = booking.requestedItems.reduce((sum, item) => {
    if (item.status === 'unavailable') return sum;
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0);
  
  booking.additionalAmount = additional;
  booking.gstAmount = 0; // GST is always 0
  
  const discount = booking.appliedCoupon?.discountAmount || 0;
  booking.grandTotal = Math.max(0, booking.subtotal + additional - discount);
  booking.finalAmount = booking.grandTotal;
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

      // References
      familyMemberId,
      vendorId,

      // Requested Items (Injection, Drip, Medicine)
      requestedItems,

      // Payments
      paymentMethod,
      paymentStatus
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

    // Generate unique booking ID
    const bookingId = await getNextBookingId();

    // Create booking with validated data
    const booking = await Booking.create({
      // Booking ID
      bookingId,
      
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
      gstAmount: 0,
      grandTotal: subtotal,

      // Preferences
      freeComplimentaryService: freeComplimentaryService || 'None',
      preferredTimeSlot,
      staffPreference: staffPreference || 'Any Available',
      serviceLocation: serviceLocation || 'At Home',
      estimatedDuration: estimatedDuration || 45,

      // References
      userId,
      familyMemberId: familyMemberId || null,
      vendorId: vendorId || null,

      // Status - If a vendor is assigned at creation, mark as accepted, otherwise pending
      bookingStatus: vendorId ? 'accepted' : 'pending',
      acceptedAt: vendorId ? new Date() : null,
      paymentMethod: paymentMethod || null,
      paymentStatus: paymentStatus || 'pending'
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
      .populate('userId', 'name email phone address familyMembers')
      .populate('vendorId', 'name phone businessName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: only user who created it, assigned vendor, or admin
    const userIdStr = booking.userId?._id?.toString() || booking.userId?.toString();
    const vendorIdStr = booking.vendorId?._id?.toString() || booking.vendorId?.toString();
    const isOwner = req.user && userIdStr === req.user._id.toString();
    const isVendor = req.vendor && vendorIdStr === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
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
      // Find matching users (by name or patientId)
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      // Find matching vendors (by name, businessName, or vendorId)
      const matchedVendors = await Vendor.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { vendorId: { $regex: search, $options: 'i' } }
        ]
      }).distinct('_id');

      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { alternateMobile: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { currentLocation: { $regex: search, $options: 'i' } },
        { 'selectedServices.serviceName': { $regex: search, $options: 'i' } },
        { userId: { $in: matchedUsers } },
        { vendorId: { $in: matchedVendors } }
      ];

      // If search is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push(
          { _id: search },
          { userId: search },
          { vendorId: search }
        );
      }
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

// @desc    Update booking (Admin)
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBooking = async (req, res) => {
  try {
    const {
      patientName,
      age,
      sex,
      address,
      pincode,
      currentLocation,
      alternateMobile,
      email,
      selectedServices,
      additionalRequirements,
      hasInsurance,
      insurancePolicyNumber,
      subtotal,
      freeComplimentaryService,
      preferredTimeSlot,
      staffPreference,
      serviceLocation,
      estimatedDuration,
      vendorId,
      userId
    } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update patient information
    if (patientName !== undefined) booking.patientName = patientName;
    if (age !== undefined) booking.age = age;
    if (sex !== undefined) booking.sex = sex;
    if (address !== undefined) booking.address = address;
    if (pincode !== undefined) booking.pincode = pincode;
    if (currentLocation !== undefined) booking.currentLocation = currentLocation;
    if (alternateMobile !== undefined) booking.alternateMobile = alternateMobile;
    if (email !== undefined) booking.email = email;

    // Update selected services
    if (selectedServices !== undefined) {
      booking.selectedServices = selectedServices;
    }

    // Additional info
    if (additionalRequirements !== undefined) booking.additionalRequirements = additionalRequirements;
    if (hasInsurance !== undefined) booking.hasInsurance = hasInsurance;
    if (insurancePolicyNumber !== undefined) booking.insurancePolicyNumber = insurancePolicyNumber;

    // Pricing (force GST to 0 and grandTotal to subtotal + additional items)
    if (subtotal !== undefined) {
      booking.subtotal = subtotal;
    }
    recalculateBookingTotals(booking);

    // Preferences
    if (freeComplimentaryService !== undefined) booking.freeComplimentaryService = freeComplimentaryService;
    if (preferredTimeSlot !== undefined) booking.preferredTimeSlot = preferredTimeSlot;
    if (staffPreference !== undefined) booking.staffPreference = staffPreference;
    if (serviceLocation !== undefined) booking.serviceLocation = serviceLocation;
    if (estimatedDuration !== undefined) booking.estimatedDuration = estimatedDuration;

    // References
    if (vendorId !== undefined) booking.vendorId = vendorId || null;
    if (userId !== undefined && /^[0-9a-fA-F]{24}$/.test(userId)) {
      booking.userId = userId;
    }

    await booking.save();

    // Populate user and vendor details before returning
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
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


export const updateRequestedItems = async (req, res) => {
  try {
    const { requestedItems } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: only the user who created it, or admin, or assigned vendor
    const isOwner = req.user && booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isVendor = req.vendor && booking.vendorId && booking.vendorId.toString() === req.vendor._id.toString();

    if (!isOwner && !isAdmin && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update requested items for this booking'
      });
    }

    // Validate requestedItems format
    if (!Array.isArray(requestedItems)) {
      return res.status(400).json({
        success: false,
        message: 'requestedItems must be an array'
      });
    }

    // Clean and validate items
    const formattedItems = requestedItems.map(item => {
      const { _id, itemName, quantity, status, price } = item;
      
      // Determine what the price should be. Only admin/vendor can set it.
      let finalPrice = 0;
      if (isAdmin || isVendor) {
        finalPrice = Number(price) || 0;
      } else {
        // Regular user: preserve existing price if it exists
        let existingItem = null;
        if (_id) {
          existingItem = booking.requestedItems.id(_id);
        }
        if (!existingItem && itemName) {
          existingItem = booking.requestedItems.find(ei => ei.itemName.toLowerCase().trim() === itemName.toLowerCase().trim());
        }
        if (existingItem) {
          finalPrice = existingItem.price || 0;
        }
      }

      return {
        _id: _id || new mongoose.Types.ObjectId(),
        itemName: itemName ? itemName.trim() : '',
        quantity: Number(quantity) || 1,
        status: status || 'pending',
        price: finalPrice
      };
    }).filter(item => item.itemName !== '');

    booking.requestedItems = formattedItems;
    
    // Recalculate billing totals
    recalculateBookingTotals(booking);
    
    await booking.save();

    // Populate user and vendor details before returning
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    res.status(200).json({
      success: true,
      message: 'Requested items updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRequestedItemStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'brought', 'unavailable'

    if (!['pending', 'brought', 'unavailable'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: only admin or assigned vendor can update status
    const isAdmin = req.user && req.user.role === 'admin';
    const isVendor = req.vendor && booking.vendorId && booking.vendorId.toString() === req.vendor._id.toString();

    if (!isAdmin && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update status of requested items'
      });
    }

    const item = booking.requestedItems.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in booking'
      });
    }

    item.status = status;
    
    // Recalculate billing totals
    recalculateBookingTotals(booking);
    
    await booking.save();

    // Populate user and vendor details before returning
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    res.status(200).json({
      success: true,
      message: 'Item status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create review for a completed booking (rating the vendor)
// @route   POST /api/bookings/:id/review/vendor
// @access  Private/User
export const createVendorReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const bookingId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide review comment text'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this booking'
      });
    }

    // Verify booking is completed
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Verify vendor is assigned
    if (!booking.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'No vendor was assigned to this booking'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      vendorId: booking.vendorId,
      userId: req.user._id,
      rating,
      reviewText: reviewText.trim()
    });

    // Mark booking as reviewed by customer
    booking.isReviewedByCustomer = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create review for a customer/user by a vendor (rating the patient)
// @route   POST /api/bookings/:id/review/user
// @access  Private/Vendor
export const createUserReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const bookingId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    if (!reviewText || !reviewText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide review comment text'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify vendor owns this booking
    if (!booking.vendorId || booking.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this booking'
      });
    }

    // Verify booking is completed
    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists
    const existingReview = await UserReview.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await UserReview.create({
      bookingId,
      vendorId: req.user._id,
      userId: booking.userId,
      rating,
      reviewText: reviewText.trim()
    });

    // Mark booking as reviewed by vendor
    booking.isReviewedByVendor = true;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Review for customer submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add runtime note to booking (Vendor/Admin)
// @route   POST /api/bookings/:id/runtime-notes
// @access  Private/Vendor/Admin
export const addRuntimeNote = async (req, res) => {
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

    // Check authorization: only admin or assigned vendor
    const isAdmin = req.user && req.user.role === 'admin';
    const isVendor = req.vendor && booking.vendorId && booking.vendorId.toString() === req.vendor._id.toString();

    if (!isAdmin && !isVendor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add runtime notes to this booking'
      });
    }

    // Determine who is adding the note
    const addedBy = isAdmin ? 'Admin' : 'Vendor';

    // Add runtime note
    booking.runtimeNotes.push({
      text: text.trim(),
      addedBy,
      addedAt: new Date()
    });

    await booking.save();

    // Populate and return updated booking
    await booking.populate('userId', 'name email phone');
    if (booking.vendorId) {
      await booking.populate('vendorId', 'name businessName phone email');
    }

    res.status(200).json({
      success: true,
      message: 'Runtime note added successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Initialize Razorpay Instance helper
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY || 'rzp_test_SzRBgNqSTAHvYZ',
    key_secret: process.env.RAZORPAY_SECRET || 'PLOmz3I3H6IAyd6f5YGq4NxW'
  });
};

// @desc    Create a Razorpay order for booking payment
// @route   POST /api/bookings/:id/pay/razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // If not admin, restrict payment until a vendor has accepted the booking
    if (req.user && req.user.role !== 'admin') {
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to pay for this booking'
        });
      }
      
      if (!booking.vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Payment can only be made after a provider has accepted and been assigned to your booking'
        });
      }
    }

    // Use finalAmount, grandTotal, or subtotal as fallback
    const payableAmount = booking.finalAmount || booking.grandTotal || booking.subtotal;
    if (!payableAmount || payableAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payable amount'
      });
    }

    const instance = getRazorpayInstance();
    const options = {
      amount: Math.round(payableAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${booking.bookingId || booking._id}`
    };

    const order = await instance.orders.create(options);

    // Save order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY || 'rzp_test_SzRBgNqSTAHvYZ'
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/bookings/:id/pay/razorpay-verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_SECRET || 'PLOmz3I3H6IAyd6f5YGq4NxW';
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update booking details
    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'razorpay';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin marks a booking paid via cash on behalf of patient
// @route   POST /api/bookings/:id/pay/admin-cash
// @access  Private/Admin
export const adminCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = 'paid';
    booking.paymentMethod = 'cash';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment processed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error in admin cash payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
