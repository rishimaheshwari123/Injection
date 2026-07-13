import Booking from '../models/Booking.js';
import AdminSetting from '../models/AdminSetting.js';
import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// @desc    Generate invoice for booking
// @route   GET /api/invoices/:bookingId
// @access  Private (User/Admin)
const fetchImageBuffer = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Failed to fetch image buffer:', error);
    return null;
  }
};

// @desc    Generate invoice for booking
// @route   GET /api/invoices/:bookingId
// @access  Private (User/Vendor/Admin)
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
    const isUser = req.user && booking.userId && booking.userId._id.toString() === req.user._id.toString();
    const isVendor = req.vendor && booking.vendorId && booking.vendorId._id.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    // Restrict invoice generation unless payment status is paid
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice can only be generated and downloaded for paid bookings'
      });
    }

    // Fetch active branding settings
    const activeSetting = await AdminSetting.findOne({ isActive: true });
    
    let logoBuffer = null;
    let signatureBuffer = null;

    if (activeSetting) {
      if (activeSetting.logoUrl) {
        logoBuffer = await fetchImageBuffer(activeSetting.logoUrl);
      }
      if (activeSetting.signatureUrl) {
        signatureBuffer = await fetchImageBuffer(activeSetting.signatureUrl);
      }
    }

    // Create PDF
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);

      // Colors
      const primaryColor = '#0f766e'; // Teal 700
      const darkColor = '#1e293b';    // Slate 800
      const lightColor = '#64748b';   // Slate 500
      const borderColor = '#e2e8f0';  // Slate 200
      const tableHeaderBg = '#f1f5f9'; // Slate 100
      const highlightBg = '#f0fdfa';   // Teal 50

      // Top decorative bar
      doc.rect(0, 0, doc.page.width, 10).fill(primaryColor);

      // --- HEADER SECTION ---
      doc.y = 35;
      const startY = doc.y;

      // Logo (if available) on the left
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 50, startY, { height: 40 });
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
        }
      }

      // Title on the right
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('INVOICE', 350, startY, { align: 'right', width: 200 });

      // Move down below logo/title
      doc.y = startY + 50;

      // Divider line
      doc.strokeColor(borderColor)
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown(0.8);

      // --- DETAILS GRID ---
      const detailsY = doc.y;

      // Left Column: Company Info
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('PRLT Health Care and Research Solutions', 50, detailsY);
      
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(lightColor)
         .text('Healthcare & Research Solutions')
         .text('GST No: XXXXXXXXXXXX');

       // Right Column: Invoice Details (align right)
      doc.fillColor(lightColor)
         .font('Helvetica')
         .fontSize(9);
      
      const detailsRightX = 350;
      
      doc.text('Date:', detailsRightX, detailsY, { width: 100, align: 'left' });
      doc.font('Helvetica-Bold').fillColor(darkColor)
         .text(new Date(booking.createdAt).toLocaleDateString('en-IN'), detailsRightX + 70, detailsY, { width: 130, align: 'right' });

      doc.font('Helvetica').fillColor(lightColor)
         .text('Booking ID:', detailsRightX, detailsY + 13, { width: 100, align: 'left' });
      doc.font('Helvetica-Bold').fillColor(darkColor)
         .text(booking.bookingId || `BK-${booking._id.toString().slice(-6).toUpperCase()}`, detailsRightX + 70, detailsY + 13, { width: 130, align: 'right' });

      doc.font('Helvetica').fillColor(lightColor)
         .text('Scheduled For:', detailsRightX, detailsY + 26, { width: 100, align: 'left' });
      doc.font('Helvetica-Bold').fillColor(darkColor)
         .text(booking.preferredTimeSlot || 'N/A', detailsRightX + 70, detailsY + 26, { width: 130, align: 'right' });

      doc.font('Helvetica').fillColor(lightColor)
         .text('Payment Status:', detailsRightX, detailsY + 39, { width: 100, align: 'left' });
      doc.font('Helvetica-Bold').fillColor(darkColor)
         .text((booking.paymentStatus || 'pending').toUpperCase(), detailsRightX + 70, detailsY + 39, { width: 130, align: 'right' });

      if (booking.paymentMethod) {
        doc.font('Helvetica').fillColor(lightColor)
           .text('Payment Method:', detailsRightX, detailsY + 52, { width: 100, align: 'left' });
        doc.font('Helvetica-Bold').fillColor(darkColor)
           .text((booking.paymentMethod).toUpperCase(), detailsRightX + 70, detailsY + 52, { width: 130, align: 'right' });
      }

      if (booking.razorpayPaymentId) {
        doc.font('Helvetica').fillColor(lightColor)
           .text('Transaction ID:', detailsRightX, detailsY + 65, { width: 100, align: 'left' });
        doc.font('Helvetica-Bold').fillColor(darkColor)
           .text(booking.razorpayPaymentId, detailsRightX + 70, detailsY + 65, { width: 130, align: 'right' });
      }

      // Move down past details
      doc.y = detailsY + 90;

      // Divider line
      doc.strokeColor(borderColor)
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown(0.8);

      // --- BILLING / VENDOR GRID ---
      const billingY = doc.y;

      // Left Column: Bill To
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('BILL TO:', 50, billingY);

      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(booking.patientName, 50, billingY + 15);

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor(lightColor)
         .text(`Age / Gender: ${booking.age} yrs / ${booking.sex}`)
         .text(`Email: ${booking.email || 'N/A'}`)
         .text(`Phone: ${booking.userId?.phone || booking.alternateMobile || 'N/A'}`)
         .text(`Address: ${booking.address}, ${booking.pincode}`);

      // Right Column: Service Provider
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('SERVICE PROVIDER:', 320, billingY);

      if (booking.vendorId) {
        doc.fillColor(darkColor)
           .font('Helvetica-Bold')
           .fontSize(10)
           .text(booking.vendorId.businessName, 320, billingY + 15);

        doc.font('Helvetica')
           .fontSize(9)
           .fillColor(lightColor)
           .text(`Contact: ${booking.vendorId.phone || 'N/A'}`)
           .text(`City: ${booking.vendorId.city || ''}, ${booking.vendorId.state || ''}`);
      } else {
        doc.fillColor(lightColor)
           .font('Helvetica-Oblique')
           .fontSize(9)
           .text('Pending Assignment (Platform Services)', 320, billingY + 15);
      }

      // Move down below billing grids
      doc.y = Math.max(doc.y, billingY + 70);

      // Divider line
      doc.strokeColor(borderColor)
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown(1);

      // --- TABLE SECTION ---
      const tableTop = doc.y;
      
      // Draw background header block
      doc.rect(50, tableTop, 500, 20).fill(tableHeaderBg);
      
      // Table Header text
      doc.fillColor(darkColor)
         .font('Helvetica-Bold')
         .fontSize(9);
      
      doc.text('Service Description', 60, tableTop + 5, { width: 220 });
      doc.text('Qty', 280, tableTop + 5, { width: 40, align: 'right' });
      doc.text('Unit Price', 330, tableTop + 5, { width: 90, align: 'right' });
      doc.text('Amount', 430, tableTop + 5, { width: 110, align: 'right' });

      // Table Rows
      let yPosition = tableTop + 20;
      doc.font('Helvetica').fontSize(9);

      booking.selectedServices.forEach((service, index) => {
        // Alternating row background for clean view
        if (index % 2 === 1) {
          doc.rect(50, yPosition, 500, 20).fill('#f8fafc');
        }
        
        doc.fillColor(darkColor);
        doc.text(service.serviceName, 60, yPosition + 5, { width: 220 });
        doc.text(service.quantity.toString(), 280, yPosition + 5, { width: 40, align: 'right' });
        doc.text(`INR ${service.price}`, 330, yPosition + 5, { width: 90, align: 'right' });
        doc.text(`INR ${service.price * service.quantity}`, 430, yPosition + 5, { width: 110, align: 'right' });
        
        yPosition += 20;
      });

      // Append requested items that are not unavailable
      let serviceIndex = booking.selectedServices.length;
      if (booking.requestedItems && Array.isArray(booking.requestedItems)) {
        booking.requestedItems.forEach((item) => {
          if (item.status === 'unavailable') return;
          
          if (serviceIndex % 2 === 1) {
            doc.rect(50, yPosition, 500, 20).fill('#f8fafc');
          }
          
          doc.fillColor(darkColor);
          doc.text(`${item.itemName} (Additional)`, 60, yPosition + 5, { width: 220 });
          doc.text(item.quantity.toString(), 280, yPosition + 5, { width: 40, align: 'right' });
          doc.text(`INR ${item.price || 0}`, 330, yPosition + 5, { width: 90, align: 'right' });
          doc.text(`INR ${(item.price || 0) * item.quantity}`, 430, yPosition + 5, { width: 110, align: 'right' });
          
          yPosition += 20;
          serviceIndex++;
        });
      }

      // Table bottom border
      doc.strokeColor(borderColor)
         .lineWidth(1)
         .moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();
      
      yPosition += 10;

      // --- TOTALS SECTION ---
      const totalsX = 330;
      doc.font('Helvetica').fontSize(9).fillColor(lightColor);

      doc.text('Booking Subtotal:', totalsX, yPosition, { width: 90, align: 'left' });
      doc.fillColor(darkColor).text(`INR ${booking.subtotal}`, totalsX + 90, yPosition, { width: 120, align: 'right' });
      yPosition += 16;

      if (booking.additionalAmount > 0) {
        doc.fillColor(lightColor).text('Additional Items:', totalsX, yPosition, { width: 90, align: 'left' });
        doc.fillColor(darkColor).text(`INR ${booking.additionalAmount}`, totalsX + 90, yPosition, { width: 120, align: 'right' });
        yPosition += 16;
      }

      if (booking.appliedCoupon && booking.appliedCoupon.discountAmount > 0) {
        doc.fillColor(lightColor).text(`Discount (${booking.appliedCoupon.couponCode || ''}):`, totalsX, yPosition, { width: 90, align: 'left' });
        doc.fillColor('#059669').text(`- INR ${booking.appliedCoupon.discountAmount}`, totalsX + 90, yPosition, { width: 120, align: 'right' });
        yPosition += 16;
      }

      doc.fillColor(lightColor).text('GST (0%):', totalsX, yPosition, { width: 90, align: 'left' });
      doc.fillColor(darkColor).text(`INR 0`, totalsX + 90, yPosition, { width: 120, align: 'right' });
      yPosition += 16;
      
      // Draw grand total box
      doc.rect(totalsX - 10, yPosition - 4, 230, 22).fill(highlightBg);
      
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Grand Total:', totalsX, yPosition, { width: 90, align: 'left' });
      
      doc.text(`INR ${booking.grandTotal}`, totalsX + 90, yPosition, { width: 120, align: 'right' });

      // Move Y position for signature
      yPosition += 35;

      // --- SIGNATURE SECTION ---
      if (signatureBuffer) {
        try {
          doc.fillColor(lightColor)
             .font('Helvetica')
             .fontSize(8)
             .text('Authorized Signature / Doctor Signature:', 350, yPosition, { align: 'right', width: 200 });
          
          yPosition += 12;
          doc.image(signatureBuffer, 430, yPosition, { height: 32 });
          yPosition += 36;
        } catch (err) {
          console.error('Error adding signature to PDF:', err);
        }
      }

      // --- FOOTER SECTION ---
      // Force footer to bottom of A4 if enough space, otherwise output inline
      const footerY = Math.max(yPosition + 30, doc.page.height - 75);
      
      doc.strokeColor(borderColor)
         .lineWidth(0.5)
         .moveTo(50, footerY - 10)
         .lineTo(doc.page.width - 50, footerY - 10)
         .stroke();

      doc.fillColor(lightColor)
         .font('Helvetica')
         .fontSize(8)
         .text('Thank you for choosing our services!', 50, footerY, { align: 'center', width: doc.page.width - 100 });
      
      doc.text('This is a computer-generated invoice and does not require a physical signature.', 50, footerY + 11, { align: 'center', width: doc.page.width - 100 });

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
// @access  Private (User/Vendor/Admin)
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
    const isUser = req.user && booking.userId && booking.userId.toString() === req.user._id.toString();
    const isVendor = req.vendor && booking.vendorId && booking.vendorId.toString() === req.vendor._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isUser && !isVendor && !isAdmin) {
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
