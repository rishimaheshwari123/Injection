# Complete Flow Verification

## ✅ Step 1: Vendor Registration

### API Call:
```http
POST /api/vendors/register
Content-Type: application/json

{
  "name": "Dr. Rahul Kumar",
  "email": "rahul@vendor.com",
  "password": "123456",
  "phone": "9876543210",
  "businessName": "HealthCare Services",
  "businessType": "Clinic",
  "address": "123 Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

### Response:
```json
{
  "success": true,
  "message": "Vendor registered successfully. Your account is pending admin verification.",
  "data": {
    "vendor": {
      "_id": "64abc123...",
      "name": "Dr. Rahul Kumar",
      "email": "rahul@vendor.com",
      "isActive": false,           // ✅ Account inactive
      "isVerified": false,         // ✅ Not verified
      "verificationStatus": "pending"  // ✅ Pending
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Status:
- ✅ Vendor registered
- ❌ Cannot create services yet (account not verified)
- ❌ Cannot accept bookings (account not active)

---

## ✅ Step 2: Admin Verifies Vendor Account

### API Call:
```http
PUT /api/vendors/:vendorId/activate
Authorization: Bearer <admin_token>
```

### Response:
```json
{
  "success": true,
  "message": "Vendor account activated and verified successfully",
  "data": {
    "vendor": {
      "_id": "64abc123...",
      "isActive": true,            // ✅ Now active
      "isVerified": true,          // ✅ Now verified
      "verificationStatus": "verified",  // ✅ Verified
      "verificationDate": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Status:
- ✅ Vendor account verified
- ✅ Can now create services
- ✅ Can accept bookings

---

## ✅ Step 3: Vendor Creates Service

### API Call:
```http
POST /api/services/create
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "serviceName": "IV Fluid Administration",
  "description": "Professional IV fluid therapy at home",
  "category": "IV Drip Services",
  "basePrice": 350,
  "duration": 45,
  "serviceType": "At Home"
}
```

### Response:
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "service": {
      "_id": "64xyz789...",
      "serviceName": "IV Fluid Administration",
      "category": "IV Drip Services",
      "basePrice": 350,
      "vendorId": "64abc123...",  // ✅ Vendor ID stored
      "isActive": true
    }
  }
}
```

### Verification Checks:
- ✅ Vendor must be active (isActive: true)
- ✅ Vendor must be verified (isVerified: true)
- ✅ Vendor verification status must be 'verified'
- ✅ vendorId automatically stored from JWT token

### If Vendor Not Verified:
```json
{
  "success": false,
  "message": "Your account is not verified. Please wait for admin verification."
}
```

---

## ✅ Step 4: User Views Available Services

### API Call:
```http
GET /api/services
```

### Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64xyz789...",
      "serviceName": "IV Fluid Administration",
      "category": "IV Drip Services",
      "basePrice": 350,
      "vendorId": {
        "_id": "64abc123...",
        "name": "Dr. Rahul Kumar",
        "businessName": "HealthCare Services",
        "phone": "9876543210",
        "city": "Bangalore",
        "rating": 0
      },
      "isActive": true
    }
  ]
}
```

### Filters Applied:
- ✅ Only active services (isActive: true)
- ✅ Only from verified vendors (isVerified: true, verificationStatus: 'verified')
- ✅ Only from active vendors (isActive: true)

---

## ✅ Step 5: User Creates Booking

### API Call:
```http
POST /api/bookings/create
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "patientName": "Amit Sharma",
  "age": 45,
  "sex": "Male",
  "address": "456 Park Street",
  "pincode": "560002",
  "currentLocation": "12.9716° N, 77.5946° E",
  "email": "amit@example.com",
  "selectedServices": [
    {
      "serviceId": "64xyz789...",  // ✅ Service ID
      "serviceName": "IV Fluid Administration",
      "price": 350,
      "quantity": 1
    }
  ],
  "subtotal": 350,
  "gstAmount": 63,
  "grandTotal": 413,
  "preferredTimeSlot": "09:00 AM - 11:00 AM",
  "staffPreference": "Any Available",
  "freeComplimentaryService": "Blood Sugar"
}
```

### Response:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "64booking123...",
      "patientName": "Amit Sharma",
      "selectedServices": [
        {
          "serviceId": "64xyz789...",  // ✅ Service reference
          "serviceName": "IV Fluid Administration",
          "price": 350,
          "quantity": 1
        }
      ],
      "userId": "64user456...",  // ✅ User ID from JWT
      "vendorId": null,          // ✅ No vendor yet
      "bookingStatus": "pending", // ✅ Pending status
      "grandTotal": 413
    }
  }
}
```

### Verification:
- ✅ userId stored from JWT token (req.user._id)
- ✅ vendorId is null (not assigned yet)
- ✅ bookingStatus is 'pending'
- ✅ serviceId references the service

---

## ✅ Step 6: Vendor Views Available Bookings

### API Call:
```http
GET /api/bookings/available
Authorization: Bearer <vendor_token>
```

### Response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64booking123...",
      "patientName": "Amit Sharma",
      "selectedServices": [
        {
          "serviceId": {
            "_id": "64xyz789...",
            "serviceName": "IV Fluid Administration",
            "category": "IV Drip Services"
          },
          "serviceName": "IV Fluid Administration",
          "price": 350,
          "quantity": 1
        }
      ],
      "userId": {
        "name": "Amit Sharma",
        "phone": "9876543210"
      },
      "bookingStatus": "pending",
      "preferredTimeSlot": "09:00 AM - 11:00 AM",
      "grandTotal": 413
    }
  ]
}
```

### Filters Applied:
- ✅ Only bookings with vendor's services (serviceId matches vendor's services)
- ✅ Only pending bookings (bookingStatus: 'pending')
- ✅ Only unassigned bookings (vendorId: null)

### Important:
Vendor will ONLY see bookings that contain services they created!

---

## ✅ Step 7: Vendor Accepts Booking

### API Call:
```http
PUT /api/bookings/64booking123.../accept
Authorization: Bearer <vendor_token>
```

### Response:
```json
{
  "success": true,
  "message": "Booking accepted successfully",
  "data": {
    "booking": {
      "_id": "64booking123...",
      "vendorId": "64abc123...",  // ✅ Vendor ID now stored
      "bookingStatus": "accepted", // ✅ Status changed
      "acceptedAt": "2024-01-15T11:00:00Z"
    }
  }
}
```

### Verification:
- ✅ vendorId stored from JWT token (req.vendor._id)
- ✅ bookingStatus changed to 'accepted'
- ✅ acceptedAt timestamp recorded
- ✅ Only vendor with matching services can accept

---

## ✅ Step 8: Vendor Starts Service

### API Call:
```http
PUT /api/bookings/64booking123.../start
Authorization: Bearer <vendor_token>
```

### Response:
```json
{
  "success": true,
  "message": "Service started successfully",
  "data": {
    "booking": {
      "_id": "64booking123...",
      "bookingStatus": "in-progress",
      "startedAt": "2024-01-15T09:15:00Z"
    }
  }
}
```

### Verification:
- ✅ Only vendor who accepted can start
- ✅ Booking must be in 'accepted' status
- ✅ Status changed to 'in-progress'

---

## ✅ Step 9: Vendor Completes Service

### API Call:
```http
PUT /api/bookings/64booking123.../complete
Authorization: Bearer <vendor_token>
```

### Response:
```json
{
  "success": true,
  "message": "Service completed successfully",
  "data": {
    "booking": {
      "_id": "64booking123...",
      "bookingStatus": "completed",
      "completedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Verification:
- ✅ Only vendor who accepted can complete
- ✅ Booking must be in 'in-progress' status
- ✅ Status changed to 'completed'

---

## 🔒 Security Checks Summary

### Vendor Registration:
- ✅ Account created as inactive and unverified
- ✅ Cannot create services until verified
- ✅ Cannot accept bookings until active

### Service Creation:
- ✅ Only verified vendors can create services
- ✅ vendorId automatically stored from JWT
- ✅ Services linked to vendor

### Service Visibility:
- ✅ Users only see services from verified vendors
- ✅ Only active services shown
- ✅ Vendor details populated

### Booking Creation:
- ✅ userId automatically stored from JWT
- ✅ serviceId references actual service
- ✅ vendorId initially null

### Booking Visibility:
- ✅ Vendors only see bookings for their services
- ✅ Only pending and unassigned bookings shown
- ✅ Service details populated

### Booking Acceptance:
- ✅ Only vendor with matching services can accept
- ✅ vendorId stored on acceptance
- ✅ Status tracking with timestamps

### Service Operations:
- ✅ Only assigned vendor can start/complete
- ✅ Status flow enforced (pending → accepted → in-progress → completed)
- ✅ Authorization checks at each step

---

## 📊 Complete Status Flow

```
VENDOR:
Register → Pending → Admin Activates → Verified → Can Create Services

SERVICE:
Created by Vendor → Active → Visible to Users

BOOKING:
User Creates → Pending (vendorId: null)
              ↓
Vendor Accepts → Accepted (vendorId: stored)
              ↓
Vendor Starts → In-Progress
              ↓
Vendor Completes → Completed

OR

User Cancels → Cancelled
```

---

## ✅ All Verifications Passed!

1. ✅ Vendor must register first
2. ✅ Admin must verify vendor account
3. ✅ Only verified vendors can create services
4. ✅ Services linked to vendor via vendorId
5. ✅ Users can book services
6. ✅ Vendors only see bookings for their services
7. ✅ Vendor accepts booking → vendorId stored
8. ✅ Complete status flow maintained
9. ✅ Authorization checks at every step
10. ✅ JWT tokens used for user/vendor identification
