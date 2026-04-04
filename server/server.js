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
import fs from 'fs';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

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
try {
  if (fs.existsSync('./config/swagger-output.json')) {
    const swaggerOutput = JSON.parse(
      fs.readFileSync('./config/swagger-output.json', 'utf8')
    );

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerOutput, {
        explorer: true,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          tryItOutEnabled: true,
        },
        customSiteTitle: 'Injection API Docs',
        customCss: '.swagger-ui .topbar { display: none }',
      })
    );
    console.log('Swagger documentation available at /api-docs');
  } else {
    console.log('Swagger documentation not available (swagger-output.json not found)');
  }
} catch (error) {
  console.log('Swagger documentation disabled:', error.message);
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
