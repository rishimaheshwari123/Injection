import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import labPartnerRoutes from './routes/labPartnerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insuranceClaimRoutes from './routes/insuranceClaim.js';
import faqRoutes from './routes/faq.js';
import couponRoutes from './routes/coupon.js';
import supportTicketRoutes from './routes/supportTicket.js';
import contactInquiryRoutes from './routes/contactInquiry.js';
import advertisementRoutes from './routes/advertisement.js';
import jobRoutes from './routes/job.js';
import blogRoutes from './routes/blogRoutes.js';
import adminSettingRoutes from './routes/adminSettingRoutes.js';
import userBookingRoutes from './routes/userBookingRoutes.js';
import vendorServiceRequestRoutes from './routes/vendorServiceRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import heroRoutes from './routes/heroRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import ambassadorRoutes from './routes/ambassadorRoutes.js';
import fs from 'fs';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const Counter = (await import('./models/Counter.js')).default;

    // Synchronize Counter collection for 'PAT' prefix with max existing PAT numbers in db
    const prefix = 'PAT';
    const users = await User.find({ patientId: { $regex: '^' + prefix } });
    let maxSeq = 0;
    for (const u of users) {
      if (u.patientId) {
        const matches = u.patientId.match(/\d+/);
        if (matches) {
          const num = parseInt(matches[0]);
          if (num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }
    
    // Update/Upsert the Counter with the maximum found sequence
    const existingCounter = await Counter.findOne({ id: prefix });
    if (!existingCounter || existingCounter.seq < maxSeq) {
      await Counter.findOneAndUpdate(
        { id: prefix },
        { $set: { seq: maxSeq } },
        { upsert: true, new: true }
      );
      console.log(`Synchronized Counter for ${prefix} to seq: ${maxSeq}`);
    }

    // Find users without PAT ID (including null, empty, or starting with USR)
    const usersWithoutPatId = await User.find({ 
      $or: [
        { patientId: { $exists: false } }, 
        { patientId: null }, 
        { patientId: "" },
        { patientId: { $regex: '^USR' } }
      ] 
    }).sort({ createdAt: 1 });
    
    if (usersWithoutPatId.length > 0) {
      console.log(`Found ${usersWithoutPatId.length} users/patients without PAT ID. Generating IDs using Counter...`);
      for (const user of usersWithoutPatId) {
        const counter = await Counter.findOneAndUpdate(
          { id: prefix },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        const formattedNum = String(counter.seq).padStart(3, '0');
        user.patientId = `${prefix}${formattedNum}`;
        await user.save();
      }
      console.log('User IDs migration to PAT sequence completed successfully!');
    }

    // Synchronize Counter collection for 'VND' prefix with max existing VND numbers in db
    const Vendor = (await import('./models/Vendor.js')).default;
    const vndPrefix = 'VND';
    const vendors = await Vendor.find({ vendorId: { $regex: '^' + vndPrefix } });
    let maxVndSeq = 0;
    for (const v of vendors) {
      if (v.vendorId) {
        const matches = v.vendorId.match(/\d+/);
        if (matches) {
          const num = parseInt(matches[0]);
          if (num > maxVndSeq) {
            maxVndSeq = num;
          }
        }
      }
    }
    
    const existingVndCounter = await Counter.findOne({ id: vndPrefix });
    if (!existingVndCounter || existingVndCounter.seq < maxVndSeq) {
      await Counter.findOneAndUpdate(
        { id: vndPrefix },
        { $set: { seq: maxVndSeq } },
        { upsert: true, new: true }
      );
      console.log(`Synchronized Counter for ${vndPrefix} to seq: ${maxVndSeq}`);
    }

    // Find vendors without VND ID
    const vendorsWithoutId = await Vendor.find({ 
      $or: [
        { vendorId: { $exists: false } }, 
        { vendorId: null }, 
        { vendorId: "" }
      ] 
    }).sort({ createdAt: 1 });
    
    if (vendorsWithoutId.length > 0) {
      console.log(`Found ${vendorsWithoutId.length} vendors without VND ID. Generating IDs using Counter...`);
      for (const vendor of vendorsWithoutId) {
        const counter = await Counter.findOneAndUpdate(
          { id: vndPrefix },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        const formattedNum = String(counter.seq).padStart(3, '0');
        vendor.vendorId = `${vndPrefix}${formattedNum}`;
        await vendor.save();
      }
      console.log('Vendor IDs migration to VND sequence completed successfully!');
    }

    // Run category migration/seeding
    const { migrateCategories } = await import('./scripts/categoryMigration.js');
    await migrateCategories();
  } catch (error) {
    console.error('Error migrating IDs:', error.message);
  }
});

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
// Increase payload limit for image uploads (base64 encoded images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded (max 10MB)',
  createParentPath: true
}));

// Swagger Documentation - Only in development
if (process.env.NODE_ENV === 'development') {
  const swaggerFile = JSON.parse(
    fs.readFileSync('./config/swagger-output.json', 'utf-8')
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/lab-partners', labPartnerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insurance', insuranceClaimRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/support', supportTicketRoutes);
app.use('/api/contact', contactInquiryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin-settings', adminSettingRoutes);
app.use('/api/user-bookings', userBookingRoutes);
app.use('/api/vendor-service-requests', vendorServiceRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ambassadors', ambassadorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Service Platform API',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
