# Healthcare Service Platform API

Backend API for Healthcare Service Platform with user, admin, and vendor management.

## Features

- ✅ User authentication with JWT
- ✅ Role-based access control (User, Admin, Vendor)
- ✅ User self-registration enabled (default role: user)
- ✅ Vendor self-registration enabled (pending verification)
- ✅ Admin can also create users and vendors
- ✅ Comprehensive user and vendor models
- ✅ Swagger API documentation
- ✅ MongoDB database integration
- ✅ Cloudinary integration for file uploads

## Installation

```bash
cd server
npm install
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=your_cloudinary_folder_name
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

Once the server is running, visit:
```
http://localhost:8080/api-docs
```

## API Endpoints

### User Authentication & Management
- `POST /api/users/register` - User/Admin registration
- `POST /api/users/login` - User/Admin login
- `GET /api/users/me` - Get current user (User/Admin)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/profile` - Update user profile (User)
- `PUT /api/users/:id/activate` - Activate user account (Admin only)
- `PUT /api/users/:id/deactivate` - Deactivate user account (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Vendor Authentication & Management
- `POST /api/vendors/register` - Vendor registration (Account pending by default)
- `POST /api/vendors/login` - Vendor login
- `GET /api/vendors` - Get all vendors (Admin only)
- `GET /api/vendors/:id` - Get vendor by ID (Public)
- `PUT /api/vendors/profile` - Update vendor profile (Vendor)
- `PUT /api/vendors/:id/activate` - Activate and verify vendor account (Admin only)
- `PUT /api/vendors/:id/deactivate` - Deactivate vendor account (Admin only)
- `DELETE /api/vendors/:id` - Delete vendor (Admin only)

### Booking Management
- `POST /api/bookings/create` - Create new booking (User)
- `GET /api/bookings/user/me` - Get user's all bookings (User)
- `GET /api/bookings/available` - Get available bookings (Vendor)
- `GET /api/bookings/vendor/me` - Get vendor's accepted bookings (Vendor)
- `GET /api/bookings/all` - Get all bookings (Admin)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/accept` - Vendor accepts booking (Vendor)
- `PUT /api/bookings/:id/start` - Start service (Vendor)
- `PUT /api/bookings/:id/complete` - Complete service (Vendor)
- `PUT /api/bookings/:id/cancel` - Cancel booking (User)
- `PUT /api/bookings/:id/status` - Update booking status (Admin)
- `DELETE /api/bookings/:id` - Delete booking (Admin)

### Service Management
- `POST /api/services/create` - Create new service (Vendor)
- `GET /api/services` - Get all services (Public)
- `GET /api/services/:id` - Get service by ID (Public)
- `GET /api/services/vendor/me` - Get vendor's all services (Vendor)
- `GET /api/services/vendor/:vendorId` - Get services by vendor ID (Public)
- `GET /api/services/category/:category` - Get services by category (Public)
- `PUT /api/services/:id` - Update service (Vendor)
- `PUT /api/services/:id/toggle-status` - Toggle service active status (Vendor)
- `DELETE /api/services/:id` - Delete service (Vendor)
### Authentication

- `POST /api/auth/register` - User registration (ENABLED - Default role: user)
- `POST /api/auth/login` - User login (ENABLED)
- `POST /api/auth/vendor/register` - Vendor registration (ENABLED - Pending verification)
- `POST /api/auth/vendor/login` - Vendor login (ENABLED)
- `POST /api/auth/admin/login` - Admin login (ENABLED)
- `POST /api/auth/admin/create-user` - Admin creates user (ENABLED)
- `POST /api/auth/admin/create-vendor` - Admin creates vendor (ENABLED)
- `GET /api/auth/me` - Get current user/vendor

## User Model Fields

- name (required)
- email (required, unique)
- password (required, min 6 characters)
- phone (required, 10 digits)
- gender (required: Male/Female/Other)
- age (required, 1-120)
- address (required)
- pincode (required, 6 digits)
- role (default: user, enum: user/admin)
- isActive (default: true)
- profileImage

## Vendor Model Fields

### Basic Information
- name, email, password, phone, alternatePhone

### Business Information
- businessName, businessType, registrationNumber, gstNumber

### Services Offered
- Array of healthcare services (Home Injections, IV Drip, etc.)

### Professional Details
- qualifications, experience, specialization

### Location Details
- address, city, state, pincode, serviceAreas

### Documents
- identityProof, qualificationCertificate, businessLicense, insuranceCertificate

### Availability
- days, timeSlots, emergencyAvailable

### Pricing
- consultationFee, homeVisitFee, emergencyFee

### Status
- isVerified, isActive, verificationStatus, rating, totalReviews

### Profile
- profileImage, bio

### Bank Details
- accountHolderName, accountNumber, ifscCode, bankName, branch

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected routes with middleware
- User self-registration with default 'user' role
- Vendor self-registration with 'pending' verification status
- Admin can create and manage all users/vendors
- Account activation/deactivation by admin

## Notes

- Users can self-register with default role 'user'
- Vendors can self-register but require admin verification
- Admin can also create users and vendors directly
- All passwords are hashed with bcrypt
- JWT tokens expire in 30 days
- Inactive accounts cannot login
