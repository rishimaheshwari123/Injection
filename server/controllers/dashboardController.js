import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Ambassador from '../models/Ambassador.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import LabPartner from '../models/LabPartner.js';
import Counter from '../models/Counter.js';
import Visit from '../models/Visit.js';

// @desc    Get user dashboard statistics
// @route   GET /api/dashboard/user/stats
// @access  Private/User
export const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's total bookings
    const totalBookings = await Booking.countDocuments({ userId });

    // Booking status breakdown for user
    const bookingsByStatus = await Booking.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // User's total spending
    const spendingData = await Booking.aggregate([
      {
        $match: {
          userId,
          bookingStatus: { $in: ['completed', 'in-progress', 'accepted'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$grandTotal' }
        }
      }
    ]);

    // User's recent bookings
    const recentBookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendorId', 'businessName name phone')
      .select('patientName bookingStatus grandTotal preferredTimeSlot createdAt selectedServices');

    // User's upcoming bookings (pending or accepted)
    const upcomingBookings = await Booking.find({
      userId,
      bookingStatus: { $in: ['pending', 'accepted'] }
    })
      .sort({ createdAt: -1 })
      .populate('vendorId', 'businessName name phone')
      .select('patientName bookingStatus grandTotal preferredTimeSlot createdAt selectedServices');

    // User's completed bookings count
    const completedBookings = await Booking.countDocuments({
      userId,
      bookingStatus: 'completed'
    });

    // User's cancelled bookings count
    const cancelledBookings = await Booking.countDocuments({
      userId,
      bookingStatus: 'cancelled'
    });

    // User's most used services
    const mostUsedServices = await Booking.aggregate([
      { $match: { userId } },
      { $unwind: '$selectedServices' },
      {
        $group: {
          _id: '$selectedServices.serviceName',
          count: { $sum: 1 },
          totalSpent: { $sum: '$selectedServices.price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          spent: { $sum: '$grandTotal' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBookings,
          completedBookings,
          cancelledBookings,
          upcomingBookingsCount: upcomingBookings.length,
          totalSpent: spendingData[0]?.totalSpent || 0
        },
        bookingsByStatus,
        recentBookings,
        upcomingBookings,
        mostUsedServices,
        monthlyBookings
      }
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await Vendor.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalLabEntries = await LabPartner.countDocuments();
    
    // Get visitor count
    const visitorCounter = await Counter.findOne({ id: 'visitors' });
    const totalVisitors = visitorCounter ? visitorCounter.seq : 0;

    // Booking status breakdown
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue calculation
    const revenueData = await Booking.aggregate([
      {
        $match: {
          bookingStatus: { $in: ['completed', 'in-progress', 'accepted'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Monthly bookings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$grandTotal' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Lab partner status breakdown
    const labsByStatus = await LabPartner.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Lab revenue calculation
    const labRevenueData = await LabPartner.aggregate([
      {
        $match: {
          status: 'Completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$cost' }
        }
      }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('patientName bookingStatus grandTotal createdAt');

    // Top services
    const topServices = await Booking.aggregate([
      { $unwind: '$selectedServices' },
      {
        $group: {
          _id: '$selectedServices.serviceName',
          count: { $sum: 1 },
          revenue: { $sum: '$selectedServices.price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          vendors: totalVendors,
          services: totalServices,
          bookings: totalBookings,
          labEntries: totalLabEntries,
          visitors: totalVisitors
        },
        bookingsByStatus,
        revenue: revenueData[0]?.totalRevenue || 0,
        labRevenue: labRevenueData[0]?.totalRevenue || 0,
        monthlyBookings,
        labsByStatus,
        recentBookings,
        topServices
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Increment visitor counter
// @route   POST /api/dashboard/visitors/increment
// @access  Public
export const incrementVisitorCount = async (req, res) => {
  try {
    let role = 'guest';
    let userId = null;
    let name = 'Guest';
    let email = '';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // Check if token exists in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role === 'vendor') {
          const vendor = await Vendor.findById(decoded.id);
          if (vendor) {
            role = 'vendor';
            userId = vendor._id;
            name = vendor.name;
            email = vendor.email;
          }
        } else if (decoded.role === 'ambassador') {
          const ambassador = await Ambassador.findById(decoded.id);
          if (ambassador) {
            role = 'ambassador';
            userId = ambassador._id;
            name = ambassador.name;
            email = ambassador.email;
          }
        } else {
          const user = await User.findById(decoded.id);
          if (user) {
            role = user.role === 'admin' ? 'admin' : 'user';
            userId = user._id;
            name = user.name;
            email = user.email;
          }
        }
      } catch (err) {
        // Token invalid, ignore and treat as guest
      }
    }

    // Upsert the specific visitor log
    const query = role === 'guest' ? { role: 'guest', ipAddress } : { role, userId };
    
    await Visit.findOneAndUpdate(
      query,
      {
        $inc: { count: 1 },
        $set: {
          ipAddress,
          name,
          email,
          userModel: role === 'vendor' ? 'Vendor' : role === 'ambassador' ? 'Ambassador' : 'User',
          lastVisited: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Also update global visitors sequence in Counter
    const counter = await Counter.findOneAndUpdate(
      { id: 'visitors' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        visitors: counter.seq
      }
    });
  } catch (error) {
    console.error('Increment visitor count error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get visitor count
// @route   GET /api/dashboard/visitors
// @access  Public
export const getVisitorCount = async (req, res) => {
  try {
    const counter = await Counter.findOne({ id: 'visitors' });
    res.status(200).json({
      success: true,
      data: {
        visitors: counter ? counter.seq : 0
      }
    });
  } catch (error) {
    console.error('Get visitor count error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get detailed visitor logs
// @route   GET /api/dashboard/visitors/logs
// @access  Private/Admin
export const getVisitorLogs = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10, sortBy = 'lastVisited', sortOrder = 'desc' } = req.query;

    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const totalLogs = await Visit.countDocuments(query);
    
    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const logs = await Visit.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get aggregated statistics
    const stats = await Visit.aggregate([
      {
        $group: {
          _id: '$role',
          totalVisits: { $sum: '$count' },
          uniqueCount: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      user: { visits: 0, unique: 0 },
      vendor: { visits: 0, unique: 0 },
      ambassador: { visits: 0, unique: 0 },
      guest: { visits: 0, unique: 0 },
      admin: { visits: 0, unique: 0 }
    };

    stats.forEach(item => {
      if (formattedStats[item._id]) {
        formattedStats[item._id].visits = item.totalVisits;
        formattedStats[item._id].unique = item.uniqueCount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalLogs / parseInt(limit))
        },
        stats: formattedStats
      }
    });
  } catch (error) {
    console.error('Get visitor logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
