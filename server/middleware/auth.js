import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user or vendor
      if (decoded.role === 'vendor') {
        req.vendor = await Vendor.findById(decoded.id);
        if (!req.vendor) {
          return res.status(401).json({
            success: false,
            message: 'Vendor not found'
          });
        }
      } else {
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin only access
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

// Vendor only access
export const vendorOnly = (req, res, next) => {
  if (req.vendor) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor only.'
    });
  }
};
