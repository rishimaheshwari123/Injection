# API Configuration Guide

## ✅ Kya Kiya Gaya Hai

### 1. Centralized API Configuration
Ek naya folder banaya gaya hai: `src/config/`

**Files:**
- `src/config/api.config.ts` - Backend URL aur endpoints ka configuration
- `src/config/README.md` - Detailed documentation

### 2. Updated API Service
`src/services/api.ts` ko update kiya gaya hai:
- Hardcoded URLs remove kar diye
- Config file se import kar raha hai
- Sabhi endpoints centrally managed hain

## 📁 File Structure

```
src/
├── config/
│   ├── api.config.ts      # API configuration (Backend URL + Endpoints)
│   └── README.md          # Documentation
├── services/
│   └── api.ts             # API service (uses config)
└── pages/
    └── admin/             # Admin pages (use api service)
```

## 🎯 Main Benefits

### 1. Single Source of Truth
```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',  // Sirf yahan change karo
  TIMEOUT: 30000,
};
```

### 2. No Hardcoded URLs
**Pehle (❌ Bad):**
```typescript
const response = await axios.get('http://localhost:8080/api/users');
```

**Ab (✅ Good):**
```typescript
import { userAPI } from '../services/api';
const response = await userAPI.getAllUsers();
```

### 3. No .env File Needed
- Environment variables ki zarurat nahi
- Direct TypeScript file mein configuration
- Type-safe aur easy to maintain

## 🚀 Kaise Use Karein

### Backend URL Change Karna

**Development:**
```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
};
```

**Production:**
```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-production-api.com/api',
  TIMEOUT: 30000,
};
```

Bas! Sirf ek jagah change karo, poore app mein update ho jayega.

### Component Mein Use Karna

```typescript
import { userAPI, vendorAPI, bookingAPI } from '../services/api';

// Users fetch karna
const fetchUsers = async () => {
  const response = await userAPI.getAllUsers();
  console.log(response.data);
};

// User status toggle karna
const toggleStatus = async (userId: string) => {
  await userAPI.toggleUserStatus(userId);
};

// Vendor activate karna
const activateVendor = async (vendorId: string) => {
  await vendorAPI.activateVendor(vendorId);
};

// Bookings fetch karna
const fetchBookings = async () => {
  const response = await bookingAPI.getAllBookings();
  console.log(response.data);
};
```

## 📋 Available APIs

### Auth APIs
```typescript
import { authAPI } from '../services/api';

// Login
await authAPI.login(email, password);

// Register
await authAPI.register(userData);
```

### User APIs
```typescript
import { userAPI } from '../services/api';

await userAPI.getAllUsers();              // Get all users
await userAPI.getUserById(id);            // Get user by ID
await userAPI.toggleUserStatus(id);       // Toggle status
await userAPI.activateUser(id);           // Activate user
await userAPI.deactivateUser(id);         // Deactivate user
await userAPI.updateProfile(data);        // Update profile
await userAPI.getMe();                    // Get current user
```

### Vendor APIs
```typescript
import { vendorAPI } from '../services/api';

await vendorAPI.register(vendorData);     // Register vendor
await vendorAPI.login(email, password);   // Login vendor
await vendorAPI.getAllVendors();          // Get all vendors
await vendorAPI.getVendorById(id);        // Get vendor by ID
await vendorAPI.activateVendor(id);       // Activate vendor
await vendorAPI.deactivateVendor(id);     // Deactivate vendor
await vendorAPI.updateProfile(data);      // Update profile
```

### Service APIs
```typescript
import { serviceAPI } from '../services/api';

await serviceAPI.getAllServices();        // Get all services
await serviceAPI.getServiceById(id);      // Get service by ID
await serviceAPI.getVendorServices();     // Get vendor's services
await serviceAPI.createService(data);     // Create service
```

### Booking APIs
```typescript
import { bookingAPI } from '../services/api';

await bookingAPI.getAllBookings();        // Get all bookings (Admin)
await bookingAPI.getBookingById(id);      // Get booking by ID
await bookingAPI.createBooking(data);     // Create booking
await bookingAPI.getUserBookings();       // Get user's bookings
await bookingAPI.getVendorBookings();     // Get vendor's bookings
await bookingAPI.getAvailableBookings();  // Get available bookings
await bookingAPI.acceptBooking(id);       // Accept booking
await bookingAPI.startService(id);        // Start service
await bookingAPI.completeService(id);     // Complete service
await bookingAPI.cancelBooking(id, reason); // Cancel booking
await bookingAPI.updateBookingStatus(id, status); // Update status
```

## 🔧 Configuration Options

### API_CONFIG
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',  // Backend URL
  TIMEOUT: 30000,                         // Request timeout (ms)
};
```

### API_ENDPOINTS
Sabhi endpoints organized hain by resource:
- `AUTH` - Authentication endpoints
- `USERS` - User management endpoints
- `VENDORS` - Vendor management endpoints
- `SERVICES` - Service management endpoints
- `BOOKINGS` - Booking management endpoints

## 📝 Example: Admin Page

```typescript
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { userAPI } from '../../services/api';
import { setUsers, setLoading } from '../../store/slices/userSlice';

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        dispatch(setUsers(response.data.data));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await userAPI.toggleUserStatus(userId);
      fetchUsers(); // Refresh
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
};
```

## ✅ Advantages

### 1. Maintainability
- Ek jagah se sab control
- Easy to update
- No scattered URLs

### 2. Type Safety
- TypeScript types
- Auto-completion
- Compile-time checks

### 3. Consistency
- Same pattern everywhere
- Easy to understand
- Less errors

### 4. Scalability
- Easy to add new endpoints
- Organized structure
- Clean code

## 🎯 Migration Complete

### Before (❌)
```typescript
// Hardcoded URLs everywhere
axios.get('http://localhost:8080/api/users')
axios.post('http://localhost:8080/api/users/login')
axios.put('http://localhost:8080/api/vendors/123/activate')
```

### After (✅)
```typescript
// Centralized configuration
import { userAPI, vendorAPI } from '../services/api';

userAPI.getAllUsers()
authAPI.login(email, password)
vendorAPI.activateVendor(id)
```

## 🚀 Ready to Use!

Ab aap:
1. ✅ Kisi bhi component mein API service import kar sakte ho
2. ✅ Backend URL ek jagah se change kar sakte ho
3. ✅ Type-safe API calls kar sakte ho
4. ✅ No hardcoded URLs
5. ✅ No .env file needed

## 📞 Quick Reference

**Change Backend URL:**
```typescript
// src/config/api.config.ts
BASE_URL: 'your-new-url-here'
```

**Use in Component:**
```typescript
import { userAPI } from '../services/api';
await userAPI.getAllUsers();
```

**Add New Endpoint:**
```typescript
// src/config/api.config.ts
USERS: {
  // ... existing endpoints
  NEW_ENDPOINT: '/users/new-endpoint',
}

// src/services/api.ts
export const userAPI = {
  // ... existing methods
  newMethod: () => api.get(API_ENDPOINTS.USERS.NEW_ENDPOINT),
};
```

## 🎉 Done!

Configuration complete aur production-ready hai!
