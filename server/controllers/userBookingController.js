import Booking from '../models/Booking.js';
import Vendor from '../models/Vendor.js';
import Notification from '../models/Notification.js';
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

// @desc    Create user booking and match with nearest vendors
// @route   POST /api/user-bookings/create
// @access  Private/User
export const createUserBooking = async (req, res) => {
  try {
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
      estimatedDuration
    } = req.body;

    const userId = req.user._id;

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

    // Create booking
    const booking = await Booking.create({
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
      hasInsurance: hasInsurance || false,
      insurancePolicyNumber,
      subtotal,
      gstAmount: 0,
      grandTotal: subtotal,
      freeComplimentaryService: freeComplimentaryService || 'None',
      preferredTimeSlot,
      staffPreference: staffPreference || 'Any Available',
      serviceLocation: serviceLocation || 'At Home',
      estimatedDuration: estimatedDuration || 45,
      userId,
      vendorId: null,
      bookingStatus: 'pending'
    });

    // Populate user details
    await booking.populate('userId', 'name email phone');

    // Auto-create a 10% discount coupon for the user's next booking (from original controller)
    try {
      let couponCode;
      let isUnique = false;

      while (!isUnique) {
        couponCode = generateCouponCode();
        const existingCoupon = await Coupon.findOne({ code: couponCode });
        if (!existingCoupon) {
          isUnique = true;
        }
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await Coupon.create({
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
    }

    // Matching Nearest Vendors based on Pincode, Staff Gender Preference, and Services Offered
    const serviceIds = selectedServices.map(s => s.serviceId);
    
    const vendorQuery = {
      isActive: true,
      verificationStatus: 'verified',
      $or: [
        { pincode: pincode },
        { serviceAreas: pincode }
      ]
    };

    if (serviceIds.length > 0) {
      vendorQuery.services = { $in: serviceIds };
    }

    // Filter by staff gender preference if specified
    // If 'Any Available', no gender filter is applied (both Male and Female vendors will match)
    if (staffPreference === 'Male Staff') {
      vendorQuery.gender = 'Male';
    } else if (staffPreference === 'Female Staff') {
      vendorQuery.gender = 'Female';
    }
    // For 'Any Available' or any other value, no gender restriction is added

    const matchingVendors = await Vendor.find(vendorQuery);

    // Create single notification with multiple vendor IDs
    if (matchingVendors.length > 0) {
      const matchedVendorIds = matchingVendors.map(vendor => vendor._id);
      
      // Create vendorStatus array for tracking individual vendor read/accept status
      const vendorStatus = matchedVendorIds.map(vendorId => ({
        vendorId: vendorId,
        isRead: false,
        isAccepted: false
      }));
      
      await Notification.create({
        vendorId: matchedVendorIds,
        bookingId: booking._id,
        message: `New booking available in your service area (${pincode}) matching your staff gender preference.`,
        type: 'new_booking',
        vendorStatus: vendorStatus
      });
      
      console.log(`Created notification for ${matchingVendors.length} vendors for booking ${booking._id}`);
      console.log(`Matched Vendor IDs: ${JSON.stringify(matchedVendorIds)}`);
      
      // Send FCM push notifications to all matched vendors
      for (const vendor of matchingVendors) {
        await sendToVendor(vendor._id, {
          title: 'New Booking Available',
          body: `New booking request in your area (${pincode}). Patient: ${patientName}`,
          data: { 
            bookingId: booking._id.toString(), 
            type: 'new_booking',
            pincode: pincode,
            patientName: patientName,
            services: selectedServices.length.toString(),
            timeSlot: preferredTimeSlot
          }
        });
      }
      
      console.log(`FCM push notifications sent to ${matchingVendors.length} vendors`);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully and matched with nearest vendors',
      data: booking,
      vendorsNotified: matchingVendors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get notifications for the logged-in vendor
// @route   GET /api/user-bookings/notifications
// @access  Private/Vendor
export const getVendorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ vendorId: req.vendor._id })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'selectedServices.serviceId', select: 'serviceName category description' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Vendor accepts a user booking
// @route   PUT /api/user-bookings/accept/:bookingId
// @access  Private/Vendor
export const acceptUserBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check if vendor account is active and verified
    if (!req.vendor.isActive || req.vendor.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified/active to accept bookings'
      });
    }

    const booking = await Booking.findById(bookingId);

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
        message: 'Booking is no longer available for acceptance'
      });
    }

    // Check if vendorId is already set
    if (booking.vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been accepted by another vendor'
      });
    }

    // Assign the booking to this vendor
    booking.vendorId = req.vendor._id;
    booking.bookingStatus = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    // Remove accepting vendor from notification's vendorId array
    // And update their status in vendorStatus array
    await Notification.updateOne(
      { bookingId },
      { 
        $pull: { 
          vendorId: req.vendor._id,
          vendorStatus: { vendorId: req.vendor._id }
        }
      }
    );

    // Check if notification still has vendors, if not delete it
    const notification = await Notification.findOne({ bookingId });
    if (notification && notification.vendorId.length === 0) {
      await Notification.deleteOne({ bookingId });
    }

    await booking.populate('userId', 'name email phone');
    await booking.populate('vendorId', 'name businessName phone email');

    // Send push notification to user that booking has been accepted
    sendToUser(booking.userId._id || booking.userId, {
      title: 'Booking Accepted',
      body: `Your booking has been accepted by ${booking.vendorId.businessName || booking.vendorId.name}. ID: ${booking._id}`,
      data: { bookingId: booking._id.toString(), type: 'booking_accepted' }
    });

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

// @desc    Mark notification as read for specific vendor
// @route   PUT /api/user-bookings/notifications/:id/read
// @access  Private/Vendor
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        vendorId: req.vendor._id,
        'vendorStatus.vendorId': req.vendor._id
      },
      { 
        $set: { 
          'vendorStatus.$.isRead': true 
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
