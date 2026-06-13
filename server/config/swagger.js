import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';

const swagger = swaggerAutogen({
  openapi: '3.0.0'
});

const doc = {
  info: {
    title: 'Injection Booking API',
    version: '1.0.0',
    description: 'Auto-generated API documentation for the Injection platform',
    contact: { name: 'API Support' },
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Development Server' },
    { url: 'https://injection-hkgt.onrender.com', description: 'Production Server' },
  ],

  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },

  security: [{ bearerAuth: [] }],

  tags: [
    { name: 'Users', description: 'User authentication & management' },
    { name: 'Vendors', description: 'Vendor operations' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Services', description: 'Service management' },
    { name: 'Prescriptions', description: 'Prescription handling' },
    { name: 'Reports', description: 'Reports & analytics' },
    { name: 'Invoices', description: 'Invoice management' },
    { name: 'Lab Partners', description: 'Lab partner operations' },
    { name: 'Dashboard', description: 'Dashboard data' },
    { name: 'Insurance', description: 'Insurance claims & policies' },
    { name: 'FAQs', description: 'Frequently asked questions' },
    { name: 'Coupons', description: 'Coupons & offers' },
    { name: 'Support', description: 'Support tickets' },
    { name: 'Contact', description: 'Contact inquiries' },
    { name: 'Advertisements', description: 'Advertisement management' },
    { name: 'Jobs', description: 'Job postings' },
    { name: 'Blogs', description: 'Blog management' },
    { name: 'Vendor Service Requests', description: 'Vendor service assignment requests' }
  ]
};

const TAG_MAP = [
  { prefix: '/api/users', tag: 'Users' },
  { prefix: '/api/vendors', tag: 'Vendors' },
  { prefix: '/api/bookings', tag: 'Bookings' },
  { prefix: '/api/services', tag: 'Services' },
  { prefix: '/api/prescriptions', tag: 'Prescriptions' },
  { prefix: '/api/reports', tag: 'Reports' },
  { prefix: '/api/invoices', tag: 'Invoices' },
  { prefix: '/api/lab-partners', tag: 'Lab Partners' },
  { prefix: '/api/dashboard', tag: 'Dashboard' },
  { prefix: '/api/insurance', tag: 'Insurance' },
  { prefix: '/api/faqs', tag: 'FAQs' },
  { prefix: '/api/coupons', tag: 'Coupons' },
  { prefix: '/api/support', tag: 'Support' },
  { prefix: '/api/contact', tag: 'Contact' },
  { prefix: '/api/advertisements', tag: 'Advertisements' },
  { prefix: '/api/jobs', tag: 'Jobs' },
  { prefix: '/api/blogs', tag: 'Blogs' },
  { prefix: '/api/vendor-service-requests', tag: 'Vendor Service Requests' }
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

const outputFile = './config/swagger-output.json';
const routes = [
  '../server.js'
];


swagger(outputFile, routes, doc).then(() => {
  assignTagsFromPaths(outputFile);
  console.log('Swagger generated successfully');
});