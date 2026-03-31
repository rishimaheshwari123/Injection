# Admin Dashboard Implementation

## Overview
The admin dashboard has been successfully implemented with Redux Toolkit for state management. The dashboard allows administrators to manage users, vendors, services, and bookings.

## Features Implemented

### 1. Authentication System
- Login page at `/login`
- JWT token stored in localStorage
- User information stored in localStorage
- Role-based access control (only `role === 'admin'` can access dashboard)

### 2. Admin Dashboard Pages
- **Dashboard** (`/admin`) - Overview with statistics and recent activity
- **Users Management** (`/admin/users`) - View, activate/deactivate users
- **Vendors Management** (`/admin/vendors`) - View, activate/deactivate vendors
- **Services Management** (`/admin/services`) - View all services created by vendors
- **Bookings Management** (`/admin/bookings`) - View all bookings with details

### 3. Redux Store Structure
```
store/
├── store.ts              # Store configuration
├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
└── slices/
    ├── authSlice.ts      # Authentication state
    ├── userSlice.ts      # Users management
    ├── vendorSlice.ts    # Vendors management
    ├── serviceSlice.ts   # Services management
    └── bookingSlice.ts   # Bookings management
```

### 4. API Service Layer
Located at `src/services/api.ts`:
- Axios instance with base URL configuration
- JWT token automatically added to requests
- Organized API endpoints for:
  - Authentication (login, register)
  - Users (CRUD operations)
  - Vendors (CRUD operations)
  - Services (read operations)
  - Bookings (read operations)

### 5. Protected Routes
- `ProtectedRoute` component checks authentication
- `requireAdmin` prop ensures only admins can access certain routes
- Automatic redirect to `/login` if not authenticated
- Automatic redirect to `/` if not admin

## How to Use

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
Backend will run on `http://localhost:8080`

### 2. Start the Frontend
```bash
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### 3. Login as Admin
Navigate to `http://localhost:5173/login` and login with admin credentials.

**Note:** To create an admin user, register with `role: 'admin'` in the request body:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "1234567890",
  "gender": "Male",
  "age": 30,
  "address": "Admin Address",
  "pincode": "123456",
  "role": "admin"
}
```

### 4. Access Admin Dashboard
After successful login, you'll be redirected to `/admin` where you can:
- View dashboard statistics
- Manage users (activate/deactivate)
- Manage vendors (activate/deactivate for verification)
- View all services
- View all bookings

## Backend API Endpoints

### User Endpoints
- `POST /api/users/register` - Register user/admin
- `POST /api/users/login` - Login user/admin
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id/toggle-status` - Toggle user status (Admin only)
- `PUT /api/users/:id/activate` - Activate user (Admin only)
- `PUT /api/users/:id/deactivate` - Deactivate user (Admin only)

### Vendor Endpoints
- `POST /api/vendors/register` - Register vendor
- `POST /api/vendors/login` - Login vendor
- `GET /api/vendors` - Get all vendors (Admin only)
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id/activate` - Activate & verify vendor (Admin only)
- `PUT /api/vendors/:id/deactivate` - Deactivate vendor (Admin only)

### Service Endpoints
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

### Booking Endpoints
- `GET /api/bookings/admin/all` - Get all bookings (Admin only)
- `GET /api/bookings/:id` - Get booking by ID

## Key Features

### 1. User Management
- Search users by name or email
- View user details (name, email, phone, role, status)
- Toggle user status (activate/deactivate)
- Real-time status updates in UI

### 2. Vendor Management
- Search vendors by business name, owner name, or email
- View vendor details (business info, contact, type, status)
- Activate vendors (sets isActive=true, isVerified=true, verificationStatus='verified')
- Deactivate vendors (sets isActive=false)
- Real-time status updates in UI

### 3. Services Management
- Search services by name, category, or vendor
- View service cards with details
- Filter by active/inactive status
- Display vendor information for each service

### 4. Bookings Management
- Search bookings by patient name, email, or status
- View detailed booking information
- See selected services with quantities and prices
- View assigned vendor (if accepted)
- Track booking status (pending, accepted, in-progress, completed, cancelled)
- Display pricing breakdown (subtotal, GST, grand total)

## State Management

### Redux Slices
Each slice manages its own state with:
- Data array (users, vendors, services, bookings)
- Loading state
- Error state
- Actions for setting data, loading, and errors

### Auth Slice
Special features:
- Persists user and token to localStorage
- Automatically loads from localStorage on app start
- Clears localStorage on logout

## Security
- JWT tokens required for all protected routes
- Role-based access control (admin only)
- Token automatically added to API requests
- Protected routes redirect unauthorized users

## UI/UX Features
- Responsive design with Tailwind CSS
- Gradient theme: `from-[#63D64F] to-[#3DB9A6]`
- Loading spinners during data fetch
- Search functionality on all pages
- Status badges with color coding
- Hover effects and transitions
- Clean sidebar navigation
- Empty state messages

## Dependencies Added
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "axios": "^1.6.0"
}
```

## File Structure
```
src/
├── components/
│   ├── AdminLayout.tsx       # Admin dashboard layout with sidebar
│   ├── ProtectedRoute.tsx    # Route protection component
│   ├── Navigation.tsx        # Public site navigation
│   └── Footer.tsx            # Public site footer
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.tsx # Admin dashboard overview
│   │   ├── UsersPage.tsx     # Users management
│   │   ├── VendorsPage.tsx   # Vendors management
│   │   ├── ServicesPage.tsx  # Services view
│   │   └── BookingsPage.tsx  # Bookings view
│   ├── LoginPage.tsx         # Login page
│   └── [other public pages]
├── services/
│   └── api.ts                # API service layer
├── store/
│   ├── store.ts              # Redux store configuration
│   ├── hooks.ts              # Typed Redux hooks
│   └── slices/               # Redux slices
├── App.tsx                   # Main app with routes
└── main.tsx                  # App entry point with Redux Provider
```

## Next Steps (Optional Enhancements)
1. Add pagination for large datasets
2. Add filters and sorting options
3. Add export functionality (CSV, PDF)
4. Add charts and analytics
5. Add email notifications
6. Add audit logs
7. Add bulk operations
8. Add advanced search with multiple filters

## Troubleshooting

### Issue: Cannot access admin dashboard
- Ensure you're logged in with an admin account (`role === 'admin'`)
- Check localStorage for `user` and `token`
- Verify backend is running on port 8080

### Issue: API calls failing
- Check backend server is running
- Verify API_URL in `src/services/api.ts` matches backend URL
- Check browser console for CORS errors
- Verify JWT token is valid

### Issue: Data not loading
- Check browser console for errors
- Verify API endpoints are correct
- Check network tab for failed requests
- Ensure admin middleware is working on backend

## Conclusion
The admin dashboard is fully functional with complete CRUD operations for users and vendors, and read operations for services and bookings. The system uses Redux Toolkit for efficient state management and provides a clean, responsive UI for administrators to manage the platform.
