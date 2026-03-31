# Quick Start Guide - Admin Dashboard

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Start Backend Server
```bash
cd server
npm start
```
✅ Backend running on `http://localhost:8080`

### Step 3: Start Frontend
```bash
# In a new terminal, from project root
npm run dev
```
✅ Frontend running on `http://localhost:5173`

### Step 4: Create Admin Account
Use any API client (Postman, Thunder Client, or curl):

```bash
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "1234567890",
  "gender": "Male",
  "age": 30,
  "address": "123 Admin Street",
  "pincode": "123456",
  "role": "admin"
}
```

### Step 5: Login to Admin Dashboard
1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign In"
4. You'll be redirected to `/admin` dashboard

## 📱 Admin Dashboard Features

### Dashboard (`/admin`)
- View total counts: Users, Vendors, Services, Bookings
- See recent bookings
- See pending vendors

### Users Management (`/admin/users`)
- View all registered users
- Search users by name or email
- Activate/Deactivate user accounts
- View user details

### Vendors Management (`/admin/vendors`)
- View all registered vendors
- Search vendors by business name, owner, or email
- Activate vendors (verify and activate account)
- Deactivate vendors
- View vendor details

### Services Management (`/admin/services`)
- View all services created by vendors
- Search services by name, category, or vendor
- View service details (price, duration, type)

### Bookings Management (`/admin/bookings`)
- View all bookings
- Search bookings by patient name, email, or status
- View booking details (services, pricing, status)
- Track booking progress

## 🔑 Key Points

### Authentication
- JWT tokens stored in localStorage
- Automatic token injection in API requests
- Session persists across page refreshes

### Access Control
- Only users with `role === 'admin'` can access dashboard
- Non-admin users redirected to home page
- Unauthenticated users redirected to login

### Data Management
- Real-time updates using Redux Toolkit
- Search functionality on all pages
- Status badges for easy identification

## 🎨 UI Features
- Responsive design (mobile, tablet, desktop)
- Gradient theme: Green to Teal
- Loading spinners during data fetch
- Empty state messages
- Hover effects and transitions

## 📊 Sample Data Flow

### User Registration Flow
1. User registers → Account created with `role: 'user'`
2. Admin can view in Users page
3. Admin can activate/deactivate account

### Vendor Registration Flow
1. Vendor registers → Account created as `pending`
2. Admin sees in Vendors page (pending status)
3. Admin clicks "Activate" → Vendor verified and active
4. Vendor can now create services

### Service Creation Flow
1. Verified vendor creates service
2. Service appears in Services page
3. Admin can view all services

### Booking Flow
1. User creates booking
2. Booking appears in Bookings page as `pending`
3. Vendor accepts → Status changes to `accepted`
4. Vendor starts → Status changes to `in-progress`
5. Vendor completes → Status changes to `completed`

## 🛠️ Troubleshooting

### Cannot login as admin
- Ensure you registered with `"role": "admin"`
- Check backend logs for errors
- Verify email and password are correct

### Dashboard not loading data
- Check backend is running on port 8080
- Check browser console for errors
- Verify JWT token in localStorage
- Check network tab for failed API calls

### CORS errors
- Backend configured with `origin: '*'`
- If issues persist, check server CORS settings

### Build errors
- Run `npm install` to ensure all dependencies installed
- Clear node_modules and reinstall if needed
- Check Node.js version (recommended: v16+)

## 📞 API Endpoints Reference

### Authentication
- `POST /api/users/register` - Register user/admin
- `POST /api/users/login` - Login

### Users (Admin Only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/toggle-status` - Toggle user status

### Vendors (Admin Only)
- `GET /api/vendors` - Get all vendors
- `PUT /api/vendors/:id/activate` - Activate vendor
- `PUT /api/vendors/:id/deactivate` - Deactivate vendor

### Services
- `GET /api/services` - Get all services

### Bookings (Admin Only)
- `GET /api/bookings/admin/all` - Get all bookings

## 🎯 Next Steps

### For Development
1. Test all admin features
2. Create sample users and vendors
3. Test booking flow
4. Verify status updates work correctly

### For Production
1. Change API_URL in `src/services/api.ts`
2. Update CORS settings in backend
3. Set strong JWT_SECRET in backend .env
4. Deploy backend and frontend separately
5. Update environment variables

## ✅ Checklist

Before using the dashboard:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Admin account created
- [ ] Can login successfully
- [ ] Dashboard loads with data
- [ ] Can manage users
- [ ] Can manage vendors
- [ ] Can view services
- [ ] Can view bookings

## 🎉 You're Ready!

The admin dashboard is now fully functional. You can:
- Manage all users
- Verify and manage vendors
- View all services
- Track all bookings
- Monitor platform activity

For detailed documentation, see `ADMIN_DASHBOARD_README.md`
