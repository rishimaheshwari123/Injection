# API Configuration

## Overview
Yeh folder centralized API configuration provide karta hai. Sabhi API calls isi configuration ko use karti hain.

## Files

### `api.config.ts`
Backend URL aur endpoints ka central configuration.

## Usage

### Backend URL Change Karna
Production mein deploy karte waqt sirf ek jagah URL change karna hai:

```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-production-api.com/api', // Yahan change karo
  TIMEOUT: 30000,
};
```

### API Endpoints Use Karna
Kisi bhi component ya service mein:

```typescript
import { API_ENDPOINTS } from '../config/api.config';

// Example: User by ID endpoint
const endpoint = API_ENDPOINTS.USERS.BY_ID('user123');
// Returns: '/users/user123'

// Example: Activate vendor endpoint
const endpoint = API_ENDPOINTS.VENDORS.ACTIVATE('vendor456');
// Returns: '/vendors/vendor456/activate'
```

### API Service Use Karna
Components mein direct API service use karo:

```typescript
import { userAPI, vendorAPI, serviceAPI, bookingAPI } from '../services/api';

// Get all users
const response = await userAPI.getAllUsers();

// Toggle user status
await userAPI.toggleUserStatus(userId);

// Get all vendors
const vendors = await vendorAPI.getAllVendors();

// Activate vendor
await vendorAPI.activateVendor(vendorId);
```

## Benefits

### 1. Single Source of Truth
- Backend URL sirf ek jagah define hai
- Sabhi files isi se import karti hain
- Koi hardcoded URL nahi

### 2. Easy Maintenance
- Production mein deploy karte waqt sirf ek file change karni hai
- Endpoints centrally managed hain
- Typos aur errors kam hote hain

### 3. Type Safety
- TypeScript types provide karti hai
- Auto-completion milta hai
- Compile-time error checking

### 4. Scalability
- Naye endpoints easily add kar sakte hain
- Consistent naming convention
- Easy to understand structure

## Available APIs

### Auth APIs
- `authAPI.login(email, password)` - User/Admin login
- `authAPI.register(userData)` - User/Admin registration

### User APIs
- `userAPI.getAllUsers()` - Get all users
- `userAPI.getUserById(id)` - Get user by ID
- `userAPI.toggleUserStatus(id)` - Toggle user active status
- `userAPI.activateUser(id)` - Activate user
- `userAPI.deactivateUser(id)` - Deactivate user
- `userAPI.updateProfile(data)` - Update user profile
- `userAPI.getMe()` - Get current user

### Vendor APIs
- `vendorAPI.register(vendorData)` - Register vendor
- `vendorAPI.login(email, password)` - Vendor login
- `vendorAPI.getAllVendors()` - Get all vendors
- `vendorAPI.getVendorById(id)` - Get vendor by ID
- `vendorAPI.activateVendor(id)` - Activate vendor
- `vendorAPI.deactivateVendor(id)` - Deactivate vendor
- `vendorAPI.updateProfile(data)` - Update vendor profile

### Service APIs
- `serviceAPI.getAllServices()` - Get all services
- `serviceAPI.getServiceById(id)` - Get service by ID
- `serviceAPI.getVendorServices()` - Get vendor's services
- `serviceAPI.createService(data)` - Create new service

### Booking APIs
- `bookingAPI.getAllBookings()` - Get all bookings (Admin)
- `bookingAPI.getBookingById(id)` - Get booking by ID
- `bookingAPI.createBooking(data)` - Create new booking
- `bookingAPI.getUserBookings()` - Get user's bookings
- `bookingAPI.getVendorBookings()` - Get vendor's bookings
- `bookingAPI.getAvailableBookings()` - Get available bookings
- `bookingAPI.acceptBooking(id)` - Accept booking
- `bookingAPI.startService(id)` - Start service
- `bookingAPI.completeService(id)` - Complete service
- `bookingAPI.cancelBooking(id, reason)` - Cancel booking
- `bookingAPI.updateBookingStatus(id, status)` - Update status

## Example: Component mein Use

```typescript
import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await userAPI.toggleUserStatus(userId);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
};
```

## Environment-Specific Configuration

### Development
```typescript
BASE_URL: 'http://localhost:8080/api'
```

### Production
```typescript
BASE_URL: 'https://api.yourapp.com/api'
```

### Staging
```typescript
BASE_URL: 'https://staging-api.yourapp.com/api'
```

## Notes
- No `.env` file needed
- No hardcoded URLs in components
- Easy to switch between environments
- Type-safe API calls
- Centralized error handling possible
- JWT token automatically added to requests
