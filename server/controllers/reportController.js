import Booking from '../models/Booking.js';
import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Generate report for booking
// @route   POST /api/reports/generate/:bookingId
// @access  Private/Vendor/Admin
export const generateReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { testResults, remarks, reportedBy } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName name phone')
      .populate('selectedServices.serviceId', 'serviceName category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if vendor owns this booking or is admin
    const isVendor = req.vendor && booking.vendorId && booking.vendorId._id.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate report for this booking'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Medical Test Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Report ID: ${booking._id}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
      doc.moveDown();

      // Patient Details
      doc.fontSize(14).text('Patient Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${booking.patientName}`);
      doc.text(`Age: ${booking.age} years`);
      doc.text(`Gender: ${booking.sex}`);
      doc.text(`Email: ${booking.email}`);
      doc.text(`Phone: ${booking.userId.phone}`);
      doc.moveDown();

      // Lab Details
      doc.fontSize(14).text('Laboratory Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Lab Name: ${booking.vendorId.businessName}`);
      doc.text(`Contact: ${booking.vendorId.phone}`);
      doc.text(`Reported By: ${reportedBy || 'Lab Technician'}`);
      doc.moveDown();

      // Tests Performed
      doc.fontSize(14).text('Tests Performed', { underline: true });
      doc.fontSize(10);
      booking.selectedServices.forEach((service, index) => {
        doc.text(`${index + 1}. ${service.serviceName} (${service.serviceId.category})`);
      });
      doc.moveDown();

      // Test Results
      if (testResults && testResults.length > 0) {
        doc.fontSize(14).text('Test Results', { underline: true });
        doc.fontSize(10);
        
        testResults.forEach((result) => {
          doc.text(`Test: ${result.testName}`);
          doc.text(`Result: ${result.value} ${result.unit || ''}`);
          doc.text(`Reference Range: ${result.referenceRange || 'N/A'}`);
          doc.text(`Status: ${result.status || 'Normal'}`);
          doc.moveDown(0.5);
        });
      }

      // Remarks
      if (remarks) {
        doc.moveDown();
        doc.fontSize(14).text('Remarks', { underline: true });
        doc.fontSize(10).text(remarks);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text('This is a computer-generated report.', { align: 'center' });
      doc.text('For any queries, please contact the laboratory.', { align: 'center' });

      doc.end();
    });

    // Convert to buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.FOLDER_NAME || 'reports',
        resource_type: 'raw',
        format: 'pdf',
        public_id: `report_${bookingId}_${Date.now()}`
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload report'
          });
        }

        // Update booking with report URL
        booking.reportUrl = result.secure_url;
        booking.reportGeneratedAt = new Date();
        booking.bookingStatus = 'completed';
        booking.completedAt = new Date();
        await booking.save();

        res.status(200).json({
          success: true,
          message: 'Report generated successfully',
          data: {
            reportUrl: result.secure_url,
            bookingId: booking._id
          }
        });
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get report for booking
// @route   GET /api/reports/:bookingId
// @access  Private (User/Vendor/Admin)
export const getReport = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isUser = req.user && booking.userId._id.toString() === req.user._id.toString();
    const isVendor = req.vendor && booking.vendorId && booking.vendorId._id.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    if (!booking.reportUrl) {
      return res.status(404).json({
        success: false,
        message: 'Report not yet generated'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        reportUrl: booking.reportUrl,
        generatedAt: booking.reportGeneratedAt,
        patientName: booking.patientName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload report (alternative method)
// @route   POST /api/reports/upload/:bookingId
// @access  Private/Vendor/Admin
export const uploadReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reportUrl, reportType, reportName } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if vendor owns this booking or is admin
    const isVendor = req.vendor && booking.vendorId && booking.vendorId._id.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload report for this booking'
      });
    }

    // Add report to reports array
    const newReport = {
      reportUrl,
      reportType: reportType || 'general',
      reportName: reportName || `Report ${booking.reports.length + 1}`,
      addedBy: req.user?.name || req.vendor?.name || 'Admin',
      addedAt: new Date()
    };

    booking.reports.push(newReport);
    
    // Update legacy fields for backward compatibility
    booking.reportUrl = reportUrl;
    booking.reportGeneratedAt = new Date();
    
    // Update status to completed if not already
    if (booking.bookingStatus !== 'completed') {
      booking.bookingStatus = 'completed';
      booking.completedAt = new Date();
    }
    
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Report uploaded successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports/admin/all
// @access  Private/Admin
export const getAllReports = async (req, res) => {
  try {
    const bookings = await Booking.find({ reportUrl: { $ne: null } })
      .populate('userId', 'name email')
      .populate('vendorId', 'businessName name')
      .sort({ reportGeneratedAt: -1 });

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
