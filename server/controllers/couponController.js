import Coupon from '../models/Coupon.js';

// Get all coupons (admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create coupon
export const createCoupon = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !code || !description || !discountType || discountValue === undefined) {
      return res.status(400).json({ 
        message: 'Name, code, description, discount type, and discount value are required' 
      });
    }

    // Validate discount type
    if (!['flat', 'percentage'].includes(discountType)) {
      return res.status(400).json({ 
        message: 'Discount type must be either "flat" or "percentage"' 
      });
    }

    // Validate discount value
    if (discountValue < 0) {
      return res.status(400).json({ 
        message: 'Discount value cannot be negative' 
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ 
        message: 'Percentage discount cannot exceed 100%' 
      });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create coupon with validated data
    const coupon = await Coupon.create({
      name,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: 'Error creating coupon', error: error.message });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      isActive
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Validate discount type if provided
    if (discountType && !['flat', 'percentage'].includes(discountType)) {
      return res.status(400).json({ 
        message: 'Discount type must be either "flat" or "percentage"' 
      });
    }

    // Validate discount value if provided
    if (discountValue !== undefined) {
      if (discountValue < 0) {
        return res.status(400).json({ 
          message: 'Discount value cannot be negative' 
        });
      }

      const finalDiscountType = discountType || coupon.discountType;
      if (finalDiscountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({ 
          message: 'Percentage discount cannot exceed 100%' 
        });
      }
    }
    
    // Check if new code conflicts with existing coupon
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }
    }

    // Update fields only if provided
    if (name !== undefined) coupon.name = name;
    if (code !== undefined) coupon.code = code.toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: 'Error updating coupon', error: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify coupon (public)
export const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }
    
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's coupons
export const getUserCoupons = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const coupons = await Coupon.find({
      userId: userId,
      isActive: true,
      isUsed: false,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Apply coupon to booking
export const applyCoupon = async (req, res) => {
  try {
    const { bookingId, couponCode } = req.body;
    const userId = req.user._id;
    
    if (!bookingId || !couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and coupon code are required'
      });
    }
    
    // Find the booking
    const Booking = (await import('../models/Booking.js')).default;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to apply coupon to this booking'
      });
    }
    
    // Check if coupon already applied
    if (booking.appliedCoupon && booking.appliedCoupon.couponId) {
      return res.status(400).json({
        success: false,
        message: 'A coupon has already been applied to this booking'
      });
    }
    
    // Find the coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      isUsed: false
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code'
      });
    }
    
    // Check if coupon belongs to user
    if (coupon.userId && coupon.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This coupon does not belong to you'
      });
    }
    
    // Check if coupon is expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (booking.grandTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    
    // Ensure discount doesn't exceed grand total
    if (discountAmount > booking.grandTotal) {
      discountAmount = booking.grandTotal;
    }
    
    const finalAmount = booking.grandTotal - discountAmount;
    
    // Update booking with coupon
    booking.appliedCoupon = {
      couponId: coupon._id,
      couponCode: coupon.code,
      discountAmount: discountAmount
    };
    booking.finalAmount = finalAmount;
    await booking.save();
    
    // Mark coupon as used
    coupon.isUsed = true;
    coupon.usedAt = new Date();
    await coupon.save();
    
    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        booking: booking,
        discount: discountAmount,
        finalAmount: finalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
