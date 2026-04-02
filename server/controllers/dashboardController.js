import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import LabPartner from '../models/LabPartner.js';

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
          labEntries: totalLabEntries
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
