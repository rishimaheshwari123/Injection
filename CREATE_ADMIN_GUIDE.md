# Admin User Creation Guide

## 🎯 Quick Start

### Step 1: Go to Server Directory
```bash
cd server
```

### Step 2: Run Admin Creation Script
```bash
npm run create-admin
```

### Step 3: Login
- URL: `http://localhost:5173/login`
- Email: `admin@admin.com`
- Password: `123456`

## 📋 Admin Credentials

```
Email:    admin@admin.com
Password: 123456
Role:     admin
```

## 🚀 Complete Setup Process

### 1. Create Admin User
```bash
cd server
npm run create-admin
```

**Expected Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB

🔄 Creating admin user...

✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: admin@admin.com
👤 Name: Admin User
📱 Phone: 9999999999
🔑 Role: admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Admin Login Credentials:
   Email: admin@admin.com
   Password: 123456

🌐 Login URL: http://localhost:5173/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Disconnected from MongoDB
```

### 2. Start Backend Server
```bash
# In server directory
npm start
```

### 3. Start Frontend (New Terminal)
```bash
# In project root
npm run dev
```

### 4. Access Admin Dashboard
1. Open browser: `http://localhost:5173`
2. Scroll to footer
3. Click "Admin Login"
4. Enter credentials:
   - Email: `admin@admin.com`
   - Password: `123456`
5. Click "Sign In"
6. You'll be redirected to `/admin` dashboard

## 📁 Script Location

```
server/
├── scripts/
│   ├── createAdmin.js    ← Admin creation script
│   └── README.md         ← Detailed documentation
└── package.json          ← Contains "create-admin" script
```

## ✅ What the Script Does

1. ✅ Connects to MongoDB
2. ✅ Checks if admin already exists
3. ✅ Creates admin user if not exists
4. ✅ Displays login credentials
5. ✅ Disconnects from MongoDB

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env` file
- Check internet connection (for MongoDB Atlas)

### Issue: "Admin already exists"
**Solution:**
- This means admin is already created
- You can login with existing credentials
- No need to run script again

### Issue: "Module not found"
**Solution:**
```bash
cd server
npm install
```

### Issue: "Cannot find .env file"
**Solution:**
- Ensure `.env` file exists in `server/` directory
- Should contain:
  ```
  MONGODB_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  ```

## 🎨 Admin Dashboard Features

After login, you can:
- ✅ View dashboard statistics
- ✅ Manage all users
- ✅ Manage all vendors
- ✅ View all services
- ✅ View all bookings
- ✅ Activate/Deactivate users
- ✅ Verify/Activate vendors

## 📊 Admin User Details

The script creates an admin with:
```javascript
{
  name: 'Admin User',
  email: 'admin@admin.com',
  password: '123456',
  phone: '9999999999',
  gender: 'Male',
  age: 30,
  address: 'Admin Office',
  pincode: '123456',
  role: 'admin',
  isActive: true
}
```

## 🔐 Security Notes

⚠️ **Important:**
- Default password is `123456`
- Change password after first login (recommended)
- Use strong password in production
- Keep credentials secure
- Don't share admin credentials

## 🎯 Alternative Methods

### Method 1: Using npm script (Recommended)
```bash
cd server
npm run create-admin
```

### Method 2: Direct node command
```bash
cd server
node scripts/createAdmin.js
```

### Method 3: Using API (Manual)
```bash
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@admin.com",
  "password": "123456",
  "phone": "9999999999",
  "gender": "Male",
  "age": 30,
  "address": "Admin Office",
  "pincode": "123456",
  "role": "admin"
}
```

## 📝 Customization

To change admin details, edit `server/scripts/createAdmin.js`:

```javascript
const adminData = {
  name: 'Your Name',           // Change name
  email: 'your@email.com',     // Change email
  password: 'your_password',   // Change password
  phone: 'your_phone',         // Change phone
  gender: 'Male',              // Male/Female/Other
  age: 30,                     // Change age
  address: 'Your Address',     // Change address
  pincode: 'your_pincode',     // Change pincode
  role: 'admin'                // Keep as 'admin'
};
```

## 🎉 Success Checklist

- [ ] MongoDB is running
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Admin created (`npm run create-admin`)
- [ ] Backend server running (`npm start`)
- [ ] Frontend running (`npm run dev`)
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Redirected to admin dashboard
- [ ] Can see dashboard statistics

## 🚀 Quick Commands Reference

```bash
# Create admin
cd server && npm run create-admin

# Start backend
cd server && npm start

# Start frontend (new terminal)
npm run dev

# Access admin
# Browser: http://localhost:5173/login
# Email: admin@admin.com
# Password: 123456
```

## 📞 Need Help?

1. Check `server/scripts/README.md` for detailed documentation
2. Verify MongoDB connection
3. Check console for error messages
4. Ensure all dependencies installed
5. Verify `.env` file exists and is correct

## ✅ Verification

After running the script, verify:
1. ✅ Script shows success message
2. ✅ Admin credentials displayed
3. ✅ No error messages
4. ✅ Can login with credentials
5. ✅ Redirected to admin dashboard

## 🎊 You're Ready!

Admin user is created and ready to use. Login and start managing your platform!

**Login URL:** http://localhost:5173/login
**Email:** admin@admin.com
**Password:** 123456

Happy managing! 🚀
