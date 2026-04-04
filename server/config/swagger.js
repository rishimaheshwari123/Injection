import fs from 'fs';
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Healthcare Service Platform API',
    version: '1.0.0',
    description: 'Auto-generated API documentation for the Healthcare Service Platform',
    contact: { name: 'API Support' },
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Development Server' },
    { url: 'https://your-production-url.com', description: 'Production Server' },
  ],

  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {

      // ── Users ─────────────────────────────────────────────────────────
      UserRegister: {
        type: 'object',
        required: ['name', 'email', 'password', 'phone'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          phone: { type: 'string', example: '9876543210' },
          password: { type: 'string', example: 'Strong@123' }
        }
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: 'Strong@123' }
        }
      },
      UserUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' }
        }
      },
      ChangePassword: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'OldPass@1' },
          newPassword: { type: 'string', example: 'NewPass@2' }
        }
      },

      // ── Vendors ───────────────────────────────────────────────────────
      VendorCreate: {
        type: 'object',
        required: ['name', 'email', 'phone', 'serviceType'],
        properties: {
          name: { type: 'string', example: 'HealthCare Vendor' },
          email: { type: 'string', example: 'vendor@example.com' },
          phone: { type: 'string', example: '9876543210' },
          serviceType: { type: 'string', example: 'Diagnostics' },
          address: { type: 'string' },
          isActive: { type: 'boolean', example: true }
        }
      },
      VendorUpdate: { $ref: '#/components/schemas/VendorCreate' },

      // ── Bookings ──────────────────────────────────────────────────────
      BookingCreate: {
        type: 'object',
        required: ['serviceId', 'userId', 'scheduledDate'],
        properties: {
          serviceId: { type: 'string', example: '65f0c1...' },
          userId: { type: 'string', example: '65f0c2...' },
          vendorId: { type: 'string', example: '65f0c3...' },
          scheduledDate: { type: 'string', format: 'date-time', example: '2026-05-01T10:00:00Z' },
          address: { type: 'string', example: '123 Main St, City' },
          notes: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['cod', 'online', 'wallet'], example: 'online' }
        }
      },
      BookingStatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            example: 'confirmed'
          }
        }
      },

      // ── Services ──────────────────────────────────────────────────────
      ServiceCreate: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          name: { type: 'string', example: 'Blood Test' },
          description: { type: 'string' },
          price: { type: 'number', example: 499 },
          discountedPrice: { type: 'number', example: 399 },
          category: { type: 'string', example: 'Diagnostics' },
          duration: { type: 'number', example: 30 },
          isAvailable: { type: 'boolean', example: true },
          image: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },
      ServiceUpdate: { $ref: '#/components/schemas/ServiceCreate' },

      // ── Prescriptions ─────────────────────────────────────────────────
      PrescriptionCreate: {
        type: 'object',
        required: ['userId', 'doctorName'],
        properties: {
          userId: { type: 'string', example: '65f0c1...' },
          doctorName: { type: 'string', example: 'Dr. Smith' },
          hospitalName: { type: 'string' },
          prescriptionDate: { type: 'string', format: 'date', example: '2026-04-01' },
          medicines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                dosage: { type: 'string' },
                frequency: { type: 'string' },
                duration: { type: 'string' }
              }
            }
          },
          notes: { type: 'string' },
          image: { type: 'string', description: 'Base64 encoded prescription image' }
        }
      },

      // ── Reports ───────────────────────────────────────────────────────
      ReportCreate: {
        type: 'object',
        required: ['userId', 'bookingId', 'reportType'],
        properties: {
          userId: { type: 'string', example: '65f0c1...' },
          bookingId: { type: 'string', example: '65f0c2...' },
          reportType: { type: 'string', example: 'Blood Report' },
          reportDate: { type: 'string', format: 'date', example: '2026-04-01' },
          findings: { type: 'string' },
          file: { type: 'string', description: 'Base64 encoded report file' }
        }
      },

      // ── Invoices ──────────────────────────────────────────────────────
      InvoiceCreate: {
        type: 'object',
        required: ['bookingId', 'userId', 'amount'],
        properties: {
          bookingId: { type: 'string', example: '65f0c1...' },
          userId: { type: 'string', example: '65f0c2...' },
          amount: { type: 'number', example: 499 },
          tax: { type: 'number', example: 24.95 },
          discount: { type: 'number', example: 50 },
          paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'], example: 'paid' },
          paymentMethod: { type: 'string', enum: ['cod', 'online', 'wallet'], example: 'online' }
        }
      },

      // ── Lab Partners ──────────────────────────────────────────────────
      LabPartnerCreate: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        properties: {
          name: { type: 'string', example: 'MedLife Labs' },
          email: { type: 'string', example: 'lab@example.com' },
          phone: { type: 'string', example: '9876543210' },
          address: { type: 'string' },
          accreditation: { type: 'string' },
          isActive: { type: 'boolean', example: true }
        }
      },
      LabPartnerUpdate: { $ref: '#/components/schemas/LabPartnerCreate' },

      // ── Insurance Claims ──────────────────────────────────────────────
      InsuranceClaimCreate: {
        type: 'object',
        required: ['userId', 'bookingId', 'insuranceProvider', 'policyNumber'],
        properties: {
          userId: { type: 'string', example: '65f0c1...' },
          bookingId: { type: 'string', example: '65f0c2...' },
          insuranceProvider: { type: 'string', example: 'Star Health' },
          policyNumber: { type: 'string', example: 'POL123456' },
          claimAmount: { type: 'number', example: 5000 },
          documents: { type: 'array', items: { type: 'string' }, description: 'Base64 encoded documents' },
          notes: { type: 'string' }
        }
      },
      InsuranceClaimStatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'under_review', 'approved', 'rejected'],
            example: 'approved'
          },
          remarks: { type: 'string' }
        }
      },

      // ── FAQs ──────────────────────────────────────────────────────────
      FaqCreate: {
        type: 'object',
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string', example: 'How do I book a service?' },
          answer: { type: 'string', example: 'You can book through the app or website.' },
          category: { type: 'string', example: 'General' },
          isPublished: { type: 'boolean', example: true },
          order: { type: 'number', example: 1 }
        }
      },
      FaqUpdate: { $ref: '#/components/schemas/FaqCreate' },

      // ── Coupons ───────────────────────────────────────────────────────
      CouponCreate: {
        type: 'object',
        required: ['code', 'discountType', 'discountValue'],
        properties: {
          code: { type: 'string', example: 'HEALTH20' },
          description: { type: 'string' },
          discountType: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
          discountValue: { type: 'number', example: 20 },
          minOrderValue: { type: 'number', example: 200 },
          maxDiscount: { type: 'number', example: 100 },
          expiryDate: { type: 'string', format: 'date', example: '2026-12-31' },
          usageLimit: { type: 'number', example: 500 },
          isActive: { type: 'boolean', example: true }
        }
      },
      CouponApply: {
        type: 'object',
        required: ['code', 'orderAmount'],
        properties: {
          code: { type: 'string', example: 'HEALTH20' },
          orderAmount: { type: 'number', example: 500 }
        }
      },

      // ── Support Tickets ───────────────────────────────────────────────
      SupportTicketCreate: {
        type: 'object',
        required: ['subject', 'message'],
        properties: {
          subject: { type: 'string', example: 'Booking not confirmed' },
          message: { type: 'string', example: 'My booking #12345 is still pending.' },
          bookingId: { type: 'string', example: '65f0c5...' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' }
        }
      },
      SupportTicketReply: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'We are looking into this issue.' }
        }
      },
      SupportTicketStatusUpdate: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['open', 'in_progress', 'resolved', 'closed'],
            example: 'resolved'
          }
        }
      },

      // ── Contact Inquiry ───────────────────────────────────────────────
      ContactInquiryCreate: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', example: 'jane@example.com' },
          phone: { type: 'string', example: '9876543210' },
          subject: { type: 'string', example: 'Partnership Inquiry' },
          message: { type: 'string', example: 'I would like to know more about your services.' }
        }
      },

      // ── Advertisements ────────────────────────────────────────────────
      AdvertisementCreate: {
        type: 'object',
        required: ['title', 'image', 'targetUrl'],
        properties: {
          title: { type: 'string', example: 'Summer Health Camp' },
          description: { type: 'string' },
          image: { type: 'string', description: 'Base64 encoded image or URL' },
          targetUrl: { type: 'string', example: 'https://example.com/offer' },
          placement: { type: 'string', enum: ['banner', 'sidebar', 'popup'], example: 'banner' },
          startDate: { type: 'string', format: 'date', example: '2026-05-01' },
          endDate: { type: 'string', format: 'date', example: '2026-05-31' },
          isActive: { type: 'boolean', example: true }
        }
      },
      AdvertisementUpdate: { $ref: '#/components/schemas/AdvertisementCreate' },

      // ── Jobs ──────────────────────────────────────────────────────────
      JobCreate: {
        type: 'object',
        required: ['title', 'description', 'location'],
        properties: {
          title: { type: 'string', example: 'Phlebotomist' },
          description: { type: 'string' },
          department: { type: 'string', example: 'Diagnostics' },
          location: { type: 'string', example: 'Mumbai' },
          type: { type: 'string', enum: ['full_time', 'part_time', 'contract', 'internship'], example: 'full_time' },
          experience: { type: 'string', example: '2-4 years' },
          salary: { type: 'string', example: '30,000 - 50,000' },
          openings: { type: 'number', example: 3 },
          isActive: { type: 'boolean', example: true },
          lastDate: { type: 'string', format: 'date', example: '2026-06-30' }
        }
      },
      JobUpdate: { $ref: '#/components/schemas/JobCreate' },
      JobApplication: {
        type: 'object',
        required: ['name', 'email', 'phone', 'resume'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          phone: { type: 'string', example: '9876543210' },
          coverLetter: { type: 'string' },
          resume: { type: 'string', description: 'Base64 encoded resume file' }
        }
      },

      // ── Blogs ─────────────────────────────────────────────────────────
      BlogCreate: {
        type: 'object',
        required: ['title', 'content', 'author'],
        properties: {
          title: { type: 'string', example: 'Top 10 Health Tips for Summer' },
          slug: { type: 'string', example: 'top-10-health-tips-for-summer' },
          content: { type: 'string' },
          excerpt: { type: 'string' },
          author: { type: 'string', example: '65f0c1...' },
          category: { type: 'string', example: 'Wellness' },
          tags: { type: 'array', items: { type: 'string' } },
          image: { type: 'string', description: 'Base64 encoded image or URL' },
          isPublished: { type: 'boolean', example: true }
        }
      },
      BlogUpdate: { $ref: '#/components/schemas/BlogCreate' },
    },
  },

  security: [{ bearerAuth: [] }],

  tags: [
    { name: 'Users', description: 'User registration, login & profile management' },
    { name: 'Vendors', description: 'Vendor/partner management' },
    { name: 'Bookings', description: 'Service booking & scheduling' },
    { name: 'Services', description: 'Healthcare service catalogue' },
    { name: 'Prescriptions', description: 'Prescription upload & management' },
    { name: 'Reports', description: 'Medical report management' },
    { name: 'Invoices', description: 'Invoice & billing management' },
    { name: 'Lab Partners', description: 'Lab partner management' },
    { name: 'Dashboard', description: 'Admin & user dashboard analytics' },
    { name: 'Insurance', description: 'Insurance claim management' },
    { name: 'FAQs', description: 'Frequently asked questions' },
    { name: 'Coupons', description: 'Coupon & discount management' },
    { name: 'Support', description: 'Customer support tickets' },
    { name: 'Contact', description: 'Contact & inquiry management' },
    { name: 'Advertisements', description: 'Banner & advertisement management' },
    { name: 'Jobs', description: 'Job listings & applications' },
    { name: 'Blogs', description: 'Blog posts & articles' },
  ],
};

// ─── Prefix → Tag (longest first to avoid partial matches) ───────────────────
const TAG_MAP = [
  { prefix: '/api/lab-partners', tag: 'Lab Partners' },
  { prefix: '/api/prescriptions', tag: 'Prescriptions' },
  { prefix: '/api/advertisements', tag: 'Advertisements' },
  { prefix: '/api/insurance', tag: 'Insurance' },
  { prefix: '/api/dashboard', tag: 'Dashboard' },
  { prefix: '/api/bookings', tag: 'Bookings' },
  { prefix: '/api/services', tag: 'Services' },
  { prefix: '/api/invoices', tag: 'Invoices' },
  { prefix: '/api/reports', tag: 'Reports' },
  { prefix: '/api/support', tag: 'Support' },
  { prefix: '/api/contact', tag: 'Contact' },
  { prefix: '/api/vendors', tag: 'Vendors' },
  { prefix: '/api/coupons', tag: 'Coupons' },
  { prefix: '/api/blogs', tag: 'Blogs' },
  { prefix: '/api/users', tag: 'Users' },
  { prefix: '/api/faqs', tag: 'FAQs' },
  { prefix: '/api/jobs', tag: 'Jobs' },
];

function assignTagsFromPaths(outputFile) {
  const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

  for (const [routePath, methods] of Object.entries(spec.paths || {})) {
    const match = TAG_MAP.find(({ prefix }) => routePath.startsWith(prefix));
    if (!match) continue;

    for (const operation of Object.values(methods)) {
      if (typeof operation !== 'object' || Array.isArray(operation)) continue;
      operation.tags = [match.tag];
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
  console.log('🏷️   Tags auto-assigned from URL prefixes');
}

function augmentSpec(outputFile) {
  const spec = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

  // Public endpoints (no auth required)
  const publicEndpoints = new Set([
    'post /api/users/register',
    'post /api/users/login',
    'post /api/vendors/login',
    'get /api/services',
    'get /api/services/{id}',
    'get /api/faqs',
    'get /api/faqs/{id}',
    'get /api/blogs',
    'get /api/blogs/{id}',
    'get /api/blogs/slug/{slug}',
    'get /api/advertisements',
    'get /api/jobs',
    'get /api/jobs/{id}',
    'post /api/contact',
    'get /health',
  ]);

  // Operation summaries and request bodies
  const opMap = {
    // Users
    'post /api/users/register': {
      summary: 'Register new user',
      requestBody: { $ref: '#/components/schemas/UserRegister' }
    },
    'post /api/users/login': {
      summary: 'Login user',
      requestBody: { $ref: '#/components/schemas/UserLogin' }
    },
    'get /api/users/profile': {
      summary: 'Get current user profile'
    },
    'put /api/users/profile': {
      summary: 'Update user profile',
      requestBody: { $ref: '#/components/schemas/UserUpdate' }
    },
    'put /api/users/change-password': {
      summary: 'Change user password',
      requestBody: { $ref: '#/components/schemas/ChangePassword' }
    },

    // Vendors
    'post /api/vendors': {
      summary: 'Create vendor',
      requestBody: { $ref: '#/components/schemas/VendorCreate' }
    },
    'put /api/vendors/{id}': {
      summary: 'Update vendor',
      requestBody: { $ref: '#/components/schemas/VendorUpdate' }
    },

    // Bookings
    'post /api/bookings': {
      summary: 'Create a new booking',
      requestBody: { $ref: '#/components/schemas/BookingCreate' }
    },
    'put /api/bookings/{id}/status': {
      summary: 'Update booking status',
      requestBody: { $ref: '#/components/schemas/BookingStatusUpdate' }
    },

    // Services
    'post /api/services': {
      summary: 'Create a service',
      requestBody: { $ref: '#/components/schemas/ServiceCreate' }
    },
    'put /api/services/{id}': {
      summary: 'Update a service',
      requestBody: { $ref: '#/components/schemas/ServiceUpdate' }
    },

    // Prescriptions
    'post /api/prescriptions': {
      summary: 'Upload prescription',
      requestBody: { $ref: '#/components/schemas/PrescriptionCreate' }
    },

    // Reports
    'post /api/reports': {
      summary: 'Create medical report',
      requestBody: { $ref: '#/components/schemas/ReportCreate' }
    },

    // Invoices
    'post /api/invoices': {
      summary: 'Create invoice',
      requestBody: { $ref: '#/components/schemas/InvoiceCreate' }
    },

    // Lab Partners
    'post /api/lab-partners': {
      summary: 'Add lab partner',
      requestBody: { $ref: '#/components/schemas/LabPartnerCreate' }
    },
    'put /api/lab-partners/{id}': {
      summary: 'Update lab partner',
      requestBody: { $ref: '#/components/schemas/LabPartnerUpdate' }
    },

    // Insurance
    'post /api/insurance': {
      summary: 'Submit insurance claim',
      requestBody: { $ref: '#/components/schemas/InsuranceClaimCreate' }
    },
    'put /api/insurance/{id}/status': {
      summary: 'Update insurance claim status',
      requestBody: { $ref: '#/components/schemas/InsuranceClaimStatusUpdate' }
    },

    // FAQs
    'post /api/faqs': {
      summary: 'Create FAQ',
      requestBody: { $ref: '#/components/schemas/FaqCreate' }
    },
    'put /api/faqs/{id}': {
      summary: 'Update FAQ',
      requestBody: { $ref: '#/components/schemas/FaqUpdate' }
    },

    // Coupons
    'post /api/coupons': {
      summary: 'Create coupon',
      requestBody: { $ref: '#/components/schemas/CouponCreate' }
    },
    'post /api/coupons/apply': {
      summary: 'Apply coupon',
      requestBody: { $ref: '#/components/schemas/CouponApply' }
    },

    // Support
    'post /api/support': {
      summary: 'Create support ticket',
      requestBody: { $ref: '#/components/schemas/SupportTicketCreate' }
    },
    'post /api/support/{id}/reply': {
      summary: 'Reply to support ticket',
      requestBody: { $ref: '#/components/schemas/SupportTicketReply' }
    },
    'put /api/support/{id}/status': {
      summary: 'Update support ticket status',
      requestBody: { $ref: '#/components/schemas/SupportTicketStatusUpdate' }
    },

    // Contact
    'post /api/contact': {
      summary: 'Submit contact inquiry',
      requestBody: { $ref: '#/components/schemas/ContactInquiryCreate' }
    },

    // Advertisements
    'post /api/advertisements': {
      summary: 'Create advertisement',
      requestBody: { $ref: '#/components/schemas/AdvertisementCreate' }
    },
    'put /api/advertisements/{id}': {
      summary: 'Update advertisement',
      requestBody: { $ref: '#/components/schemas/AdvertisementUpdate' }
    },

    // Jobs
    'post /api/jobs': {
      summary: 'Create job listing',
      requestBody: { $ref: '#/components/schemas/JobCreate' }
    },
    'put /api/jobs/{id}': {
      summary: 'Update job listing',
      requestBody: { $ref: '#/components/schemas/JobUpdate' }
    },
    'post /api/jobs/{id}/apply': {
      summary: 'Apply for a job',
      requestBody: { $ref: '#/components/schemas/JobApplication' }
    },

    // Blogs
    'post /api/blogs': {
      summary: 'Create blog post',
      requestBody: { $ref: '#/components/schemas/BlogCreate' }
    },
    'put /api/blogs/{id}': {
      summary: 'Update blog post',
      requestBody: { $ref: '#/components/schemas/BlogUpdate' }
    },
  };

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== 'object' || Array.isArray(operation)) continue;
      const key = `${method.toLowerCase()} ${path}`;

      // Remove security for public endpoints
      if (publicEndpoints.has(key)) {
        operation.security = [];
      }

      // Add summary & requestBody
      const conf = opMap[key];
      if (conf) {
        if (conf.summary) operation.summary = conf.summary;
        if (conf.requestBody) {
          operation.requestBody = {
            required: true,
            content: {
              'application/json': {
                schema: conf.requestBody
              }
            }
          };
        }
      }
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
  console.log('🧩  Spec augmented with summaries, request bodies and security rules');
}

// ─────────────────────────────────────────────────────────────────────────────

const outputFile = './config/swagger-output.json';
const routes = ['./server.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
  assignTagsFromPaths(outputFile);
  augmentSpec(outputFile);
  console.log('✅  swagger-output.json generated successfully');
});