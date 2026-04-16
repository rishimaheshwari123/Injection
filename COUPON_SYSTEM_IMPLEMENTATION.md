# Automatic Coupon System Implementation

## Overview
Implemented an automatic coupon system that creates a 10% discount coupon for every booking and allows users to apply coupons to their bookings.

## Features Implemented

### 1. Auto-Create Coupon on Booking
- **When**: Every time a booking is created
- **Discount**: 10% off on next booking
- **Validity**: 30 days from creation
- **Code Format**: `BOOK` + 8 random alphanumeric characters (e.g., `BOOKA3X7K9M2`)
- **User-Specific**: Coupon is linked to the user who created the booking

### 2. Database Schema Updates

#### Coupon Model (`server/models/Coupon.js`)
Added new fields:
```javascript
{
  userId: ObjectId,           // User who owns the coupon
  bookingId: ObjectId,        // Booking that generated this coupon
  isUsed: Boolean,            // Whether coupon has been used
  usedAt: Date,               // When coupon was used
  expiresAt: Date             // Expiry date (30 days from creation)
}
```

#### Booking Model (`server/models/Booking.js`)
Added coupon tracking:
```javascript
{
  appliedCoupon: {
    couponId: ObjectId,       // Reference to applied coupon
    couponCode: String,       // Coupon code used
    discountAmount: Number    // Discount amount applied
  },
  finalAmount: Number         // Grand total after discount
}
```

### 3. New API Endpoints

#### Get User's Coupons
```
GET /api/coupons/user/my-coupons
Authorization: Bearer <token>
```
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "name": "Booking Reward - John Doe",
      "code": "BOOKA3X7K9M2",
      "description": "10% discount coupon for your next booking. Valid for 30 days.",
      "discountType": "percentage",
      "discountValue": 10,
      "isActive": true,
      "userId": "...",
      "bookingId": "...",
      "isUsed": false,
      "expiresAt": "2026-05-16T...",
      "createdAt": "2026-04-16T..."
    }
  ]
}
```

#### Apply Coupon to Booking
```
POST /api/coupons/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "69e070a00afebafc623979ca",
  "couponCode": "BOOKA3X7K9M2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "booking": { ... },
    "discount": 500,
    "finalAmount": 4500
  }
}
```

**Error Cases:**
- `400`: Coupon already applied to booking
- `403`: Coupon doesn't belong to user
- `404`: Invalid or inactive coupon
- `400`: Coupon expired

## How It Works

### 1. Booking Creation Flow
```
User creates booking
    ↓
Booking saved to database
    ↓
Auto-generate unique coupon code
    ↓
Create coupon with:
  - 10% discount
  - 30 days validity
  - Linked to user & booking
    ↓
Return booking response
```

### 2. Apply Coupon Flow
```
User requests to apply coupon
    ↓
Validate booking ownership
    ↓
Check if coupon already applied
    ↓
Validate coupon:
  - Exists & active
  - Belongs to user
  - Not used
  - Not expired
    ↓
Calculate discount:
  - Percentage: (grandTotal × 10) / 100
  - Flat: discountValue
    ↓
Update booking:
  - appliedCoupon details
  - finalAmount = grandTotal - discount
    ↓
Mark coupon as used
    ↓
Return updated booking
```

## Validation Rules

### Coupon Application
1. ✅ User must own the booking
2. ✅ Only one coupon per booking
3. ✅ Coupon must belong to the user
4. ✅ Coupon must be active and unused
5. ✅ Coupon must not be expired
6. ✅ Discount cannot exceed grand total

### Coupon Generation
1. ✅ Unique code generation (checks for duplicates)
2. ✅ Auto-linked to user and booking
3. ✅ 30-day expiry from creation
4. ✅ 10% percentage discount
5. ✅ Active by default

## Example Usage

### Frontend Integration

#### 1. Fetch User's Coupons
```javascript
const fetchMyCoupons = async () => {
  const response = await fetch('/api/coupons/user/my-coupons', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data; // Array of coupons
};
```

#### 2. Apply Coupon
```javascript
const applyCoupon = async (bookingId, couponCode) => {
  const response = await fetch('/api/coupons/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bookingId, couponCode })
  });
  const data = await response.json();
  return data;
};
```

#### 3. Display Discount in Booking Summary
```javascript
// Before coupon
Subtotal: ₹4,500
GST (18%): ₹810
Grand Total: ₹5,310

// After applying 10% coupon
Subtotal: ₹4,500
GST (18%): ₹810
Grand Total: ₹5,310
Coupon Discount (10%): -₹531
Final Amount: ₹4,779
```

## Database Indexes
Added for performance:
- `Coupon.userId` - Fast user coupon lookup
- `Coupon.code` - Fast coupon verification
- `Coupon.isUsed` - Filter unused coupons
- `Coupon.expiresAt` - Filter expired coupons

## Security Features
1. ✅ User authentication required
2. ✅ Coupon ownership validation
3. ✅ Booking ownership validation
4. ✅ One-time use enforcement
5. ✅ Expiry date validation
6. ✅ Unique code generation

## Testing Checklist

### Create Booking
- [ ] Booking created successfully
- [ ] Coupon auto-generated
- [ ] Coupon code is unique
- [ ] Coupon linked to user
- [ ] Coupon expires in 30 days
- [ ] Coupon is 10% discount

### Get User Coupons
- [ ] Returns only user's coupons
- [ ] Filters out used coupons
- [ ] Filters out expired coupons
- [ ] Sorted by creation date

### Apply Coupon
- [ ] Successfully applies valid coupon
- [ ] Calculates correct discount
- [ ] Updates booking with coupon details
- [ ] Marks coupon as used
- [ ] Prevents double application
- [ ] Validates coupon ownership
- [ ] Checks expiry date
- [ ] Handles invalid coupon codes

## Notes
- Coupon creation failure doesn't fail the booking (logged as error)
- Discount is calculated on `grandTotal` (includes GST)
- `finalAmount` is stored in booking for payment processing
- Expired coupons remain in database but are filtered out
- Admin can still create manual coupons via existing endpoints
