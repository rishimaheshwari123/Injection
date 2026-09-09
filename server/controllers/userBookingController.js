import Booking from '../models/Booking.js';
import Vendor from '../models/Vendor.js';
import Notification from '../models/Notification.js';
import Coupon from '../models/Coupon.js';
import Counter from '../models/Counter.js';
import cloudinary from '../config/cloudinary.js';
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

      // Prescription Information (Optional)
      prescriptions,
      prescriptionData,
      prescriptionType,
      prescriptionUrl,
      prescriptionDocument,
      prescription,
      doctorName,
      doctorRegistration,
      hospitalName,
      patientComplaints,
      diagnosis,
      medications,
      labTests,
      specialInstructions,
      followUpDate,
      imageUrl,
      supportingImageUrl,

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

      // Payments
      paymentMethod,
      paymentStatus
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!patientName || !age || !sex || !address || !pincode || !currentLocation || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required patient information'
      });
    }

    let parsedSelectedServices = selectedServices;
    if (typeof selectedServices === 'string') {
      try {
        parsedSelectedServices = JSON.parse(selectedServices);
      } catch (e) {
        parsedSelectedServices = selectedServices;
      }
    }

    if (!parsedSelectedServices || parsedSelectedServices.length === 0) {
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

    // Process optional prescription (file upload or json data)
    let uploadedPrescriptionUrl = null;
    if (req.files) {
      const fileToUpload = req.files.prescription || req.files.prescriptionImage || req.files.prescriptionFile || req.files.image || req.files.file;
      if (fileToUpload) {
        try {
          const uploadResult = await cloudinary.uploader.upload(fileToUpload.tempFilePath, {
            folder: process.env.FOLDER_NAME || 'prescriptions',
            resource_type: 'auto'
          });
          uploadedPrescriptionUrl = uploadResult.secure_url;
        } catch (uploadErr) {
          console.error('Error uploading prescription to Cloudinary:', uploadErr);
        }
      }
    }

    const bookingPrescriptions = [];
    let bookingPrescriptionDocument = uploadedPrescriptionUrl || prescriptionUrl || prescriptionDocument || null;

    // 1. Multiple prescriptions array provided
    if (prescriptions) {
      let parsedPrescriptions = prescriptions;
      if (typeof prescriptions === 'string') {
        try {
          parsedPrescriptions = JSON.parse(prescriptions);
        } catch (e) {
          parsedPrescriptions = [];
        }
      }
      if (Array.isArray(parsedPrescriptions) && parsedPrescriptions.length > 0) {
        for (const p of parsedPrescriptions) {
          if (p) {
            const itemImg = p.imageUrl || null;
            if (itemImg && !bookingPrescriptionDocument) {
              bookingPrescriptionDocument = itemImg;
            }
            let itemMeds = [];
            if (Array.isArray(p.medications)) {
              itemMeds = p.medications;
            } else if (typeof p.medications === 'string') {
              try { itemMeds = JSON.parse(p.medications); } catch (e) { itemMeds = []; }
            }

            bookingPrescriptions.push({
              type: p.type || (itemImg ? 'image' : 'form'),
              doctorName: p.doctorName || '',
              doctorRegistration: p.doctorRegistration || '',
              hospitalName: p.hospitalName || '',
              patientComplaints: p.patientComplaints || '',
              diagnosis: p.diagnosis || '',
              medications: itemMeds,
              labTests: p.labTests || '',
              specialInstructions: p.specialInstructions || '',
              followUpDate: p.followUpDate || null,
              imageUrl: itemImg,
              supportingImageUrl: p.supportingImageUrl || null,
              addedBy: req.user?.name || 'User',
              addedAt: new Date()
            });
          }
        }
      }
    }

    // 2. Single prescriptionData or prescription object provided
    let pData = prescriptionData || prescription;
    if (typeof pData === 'string') {
      try {
        pData = JSON.parse(pData);
      } catch (e) {
        pData = null;
      }
    }

    if (pData && typeof pData === 'object') {
      const pType = prescriptionType || pData.type || (pData.imageUrl || uploadedPrescriptionUrl ? 'image' : 'form');
      const img = pData.imageUrl || uploadedPrescriptionUrl || null;
      const supportingImg = pData.supportingImageUrl || (pType === 'form' ? uploadedPrescriptionUrl : null);

      let meds = [];
      if (Array.isArray(pData.medications)) {
        meds = pData.medications;
      } else if (typeof pData.medications === 'string') {
        try { meds = JSON.parse(pData.medications); } catch (e) { meds = []; }
      }

      const hasContent = pData.doctorName || pData.diagnosis || pData.hospitalName ||
        pData.patientComplaints || pData.labTests || pData.specialInstructions ||
        (meds && meds.length > 0) || img || supportingImg;

      if (hasContent) {
        bookingPrescriptions.push({
          type: pType,
          doctorName: pData.doctorName || '',
          doctorRegistration: pData.doctorRegistration || '',
          hospitalName: pData.hospitalName || '',
          patientComplaints: pData.patientComplaints || '',
          diagnosis: pData.diagnosis || '',
          medications: meds,
          labTests: pData.labTests || '',
          specialInstructions: pData.specialInstructions || '',
          followUpDate: pData.followUpDate || null,
          imageUrl: pType === 'image' ? img : null,
          supportingImageUrl: supportingImg,
          addedBy: req.user?.name || 'User',
          addedAt: new Date()
        });
        if (img && !bookingPrescriptionDocument) {
          bookingPrescriptionDocument = img;
        }
      }
    } else if (uploadedPrescriptionUrl || prescriptionUrl || prescriptionDocument || imageUrl) {
      // 3. Image URL or uploaded document only
      const finalDocUrl = uploadedPrescriptionUrl || prescriptionUrl || prescriptionDocument || imageUrl;
      bookingPrescriptionDocument = finalDocUrl;
      bookingPrescriptions.push({
        type: 'image',
        imageUrl: finalDocUrl,
        supportingImageUrl: null,
        addedBy: req.user?.name || 'User',
        addedAt: new Date()
      });
    } else if (doctorName || diagnosis || hospitalName || (medications && medications.length > 0)) {
      // 4. Direct top-level fields
      let meds = [];
      if (Array.isArray(medications)) {
        meds = medications;
      } else if (typeof medications === 'string') {
        try { meds = JSON.parse(medications); } catch (e) { meds = []; }
      }

      bookingPrescriptions.push({
        type: prescriptionType || 'form',
        doctorName: doctorName || '',
        doctorRegistration: doctorRegistration || '',
        hospitalName: hospitalName || '',
        patientComplaints: patientComplaints || '',
        diagnosis: diagnosis || '',
        medications: meds,
        labTests: labTests || '',
        specialInstructions: specialInstructions || '',
        followUpDate: followUpDate || null,
        imageUrl: imageUrl || null,
        supportingImageUrl: supportingImageUrl || null,
        addedBy: req.user?.name || 'User',
        addedAt: new Date()
      });
    }

    // Generate unique booking ID
    const bookingId = await getNextBookingId();

    // Create booking
    const booking = await Booking.create({
      bookingId,
      patientName,
      age,
      sex,
      address,
      pincode,
      currentLocation,
      alternateMobile,
      email,
      selectedServices: parsedSelectedServices,
      additionalRequirements,
      prescriptions: bookingPrescriptions,
      prescriptionDocument: bookingPrescriptionDocument,
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
      familyMemberId: familyMemberId || null,
      vendorId: null,
      bookingStatus: 'pending',
      paymentMethod: paymentMethod || null,
      paymentStatus: paymentStatus || 'pending'
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
    const serviceIds = (parsedSelectedServices || []).map(s => s.serviceId);
    
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
