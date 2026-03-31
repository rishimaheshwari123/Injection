# Admin Creation Script

## Overview
Yeh script automatically admin user create karta hai database mein.

## Admin Credentials
```
Email: admin@admin.com
Password: 123456
Role: admin
```

## How to Run

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

## What It Does

1. ✅ MongoDB se connect karta hai
2. ✅ Check karta hai ki admin already exists ya nahi
3. ✅ Agar nahi hai to naya admin create karta hai
4. ✅ Agar already hai to message show karta hai
5. ✅ Login credentials display karta hai
6. ✅ MongoDB se disconnect karta hai

## Output Example

### If Admin Created Successfully:
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

### If Admin Already Exists:
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB
⚠️  Admin user already exists!
📧 Email: admin@admin.com
👤 Name: Admin User
🔑 Role: admin

✅ You can login with:
   Email: admin@admin.com
   Password: 123456

✅ Disconnected from MongoDB
```

## Requirements

### 1. MongoDB Running
Ensure MongoDB is running and connection string is correct in `.env` file:
```
MONGODB_URI=mongodb+srv://...
```

### 2. Dependencies Installed
```bash
cd server
npm install
```

### 3. Environment Variables
`.env` file should have:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Admin User Details

The script creates an admin with these details:
- **Name:** Admin User
- **Email:** admin@admin.com
- **Password:** 123456
- **Phone:** 9999999999
- **Gender:** Male
- **Age:** 30
- **Address:** Admin Office
- **Pincode:** 123456
- **Role:** admin
- **Status:** Active (isActive: true)

## After Creating Admin

### 1. Start Backend Server
```bash
cd server
npm start
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Login as Admin
1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@admin.com`
   - Password: `123456`
3. Click "Sign In"
4. You'll be redirected to admin dashboard

## Troubleshooting

### Error: Cannot connect to MongoDB
- Check if MongoDB is running
- Verify MONGODB_URI in .env file
- Check internet connection (if using MongoDB Atlas)

### Error: Admin already exists
- This is not an error, admin is already created
- You can login with existing credentials
- If you want to reset, delete the user from database first

### Error: Module not found
```bash
cd server
npm install
```

### Error: JWT_SECRET not defined
Add JWT_SECRET to .env file:
```
JWT_SECRET=your_secret_key_here
```

## Security Notes

⚠️ **Important:**
- Change the default password after first login
- Use strong password in production
- Don't commit .env file to git
- Keep admin credentials secure

## Customization

To change admin details, edit `server/scripts/createAdmin.js`:

```javascript
const adminData = {
  name: 'Your Name',
  email: 'your@email.com',
  password: 'your_password',
  phone: 'your_phone',
  gender: 'Male/Female/Other',
  age: 30,
  address: 'Your Address',
  pincode: 'your_pincode',
  role: 'admin'
};
```

## Quick Start Guide

```bash
# 1. Go to server directory
cd server

# 2. Install dependencies (if not already)
npm install

# 3. Create admin user
npm run create-admin

# 4. Start server
npm start

# 5. In another terminal, start frontend
cd ..
npm run dev

# 6. Open browser and login
# URL: http://localhost:5173/login
# Email: admin@admin.com
# Password: 123456
```

## Script Location
```
server/
├── scripts/
│   ├── createAdmin.js    # Admin creation script
│   └── README.md         # This file
├── models/
│   └── User.js           # User model
├── .env                  # Environment variables
└── package.json          # npm scripts
```

## Additional Scripts

You can create more utility scripts in this folder:
- `createTestUsers.js` - Create test users
- `createTestVendors.js` - Create test vendors
- `seedDatabase.js` - Seed database with sample data
- `cleanDatabase.js` - Clean/reset database

## Support

If you face any issues:
1. Check MongoDB connection
2. Verify .env file
3. Check console for error messages
4. Ensure all dependencies are installed

Happy coding! 🚀
