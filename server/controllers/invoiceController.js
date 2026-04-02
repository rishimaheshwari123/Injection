import Booking from '../models/Booking.js';
import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Generate invoice for booking
// @route   GET /api/invoices/:bookingId
// @access  Private (User/Admin)
export const generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone address pincode')
      .populate('vendorId', 'businessName name phone address city state')
      .populate('selectedServices.serviceId', 'serviceName category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isUser = req.user && booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
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
      doc.fontSize(24).text('INVOICE', { align: 'center', underline: true });
      doc.moveDown();

      // Company Details
      doc.fontSize(12).text('PRLT Health Care and Research Solutions', { bold: true });
      doc.fontSize(10).text('Research Solutions');
      doc.text('GST No: XXXXXXXXXXXX');
      doc.moveDown();

      // Invoice Details
      doc.fontSize(10);
      doc.text(`Invoice No: INV-${booking._id.toString().slice(-8).toUpperCase()}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
      doc.text(`Booking ID: ${booking._id}`, { align: 'right' });
      doc.moveDown();

      // Bill To
      doc.fontSize(12).text('Bill To:', { underline: true });
      doc.fontSize(10);
      doc.text(`Name: ${booking.patientName}`);
      doc.text(`Email: ${booking.email}`);
      doc.text(`Phone: ${booking.userId.phone}`);
      doc.text(`Address: ${booking.address}, ${booking.pincode}`);
      doc.moveDown();

      // Service Provider
      if (booking.vendorId) {
        doc.fontSize(12).text('Service Provider:', { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${booking.vendorId.businessName}`);
        doc.text(`Contact: ${booking.vendorId.phone}`);
        doc.moveDown();
      }

      // Table Header
      doc.fontSize(10);
      const tableTop = doc.y;
      doc.text('Service', 50, tableTop, { width: 200 });
      doc.text('Qty', 250, tableTop, { width: 50 });
      doc.text('Price', 300, tableTop, { width: 100 });
      doc.text('Amount', 400, tableTop, { width: 100 });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown();

      // Table Rows
      let yPosition = tableTop + 25;
      booking.selectedServices.forEach((service) => {
        doc.text(service.serviceName, 50, yPosition, { width: 200 });
        doc.text(service.quantity.toString(), 250, yPosition, { width: 50 });
        doc.text(`₹${service.price}`, 300, yPosition, { width: 100 });
        doc.text(`₹${service.price * service.quantity}`, 400, yPosition, { width: 100 });
        yPosition += 20;
      });

      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // Totals
      doc.text('Subtotal:', 350, yPosition);
      doc.text(`₹${booking.subtotal}`, 450, yPosition);
      yPosition += 20;

      doc.text(`GST (18%):`, 350, yPosition);
      doc.text(`₹${booking.gstAmount}`, 450, yPosition);
      yPosition += 20;

      doc.fontSize(12).text('Grand Total:', 350, yPosition, { bold: true });
      doc.text(`₹${booking.grandTotal}`, 450, yPosition, { bold: true });
      doc.fontSize(10);

      // Footer
      doc.moveDown(3);
      doc.fontSize(8).text('Thank you for choosing our services!', { align: 'center' });
      doc.text('This is a computer-generated invoice.', { align: 'center' });

      doc.end();
    });

    // Convert to buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${bookingId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get invoice URL (if stored)
// @route   GET /api/invoices/url/:bookingId
// @access  Private (User/Admin)
export const getInvoiceUrl = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isUser = req.user && booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        invoiceUrl: `/api/invoices/${bookingId}`,
        amount: booking.grandTotal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
