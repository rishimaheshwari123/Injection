import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Admin credentials
const adminData = {
  name: 'Admin User',
  email: 'admin@admin.com',
  password: '123456',
  phone: '9999999999',
  gender: 'Male',
  age: 30,
  address: 'Admin Office',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '123456',
  longitude: 75.8577,
  latitude: 22.7196,
  role: 'admin'
};

// Connect to MongoDB and create admin
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('\n✅ You can login with:');
      console.log('   Email: admin@admin.com');
      console.log('   Password: 123456');
    } else {
      // Create new admin user
      console.log('\n🔄 Creating admin user...');
      const admin = await User.create(adminData);
      
      console.log('\n✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('📱 Phone:', admin.phone);
      console.log('🔑 Role:', admin.role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎉 Admin Login Credentials:');
      console.log('   Email: admin@admin.com');
      console.log('   Password: 123456');
      console.log('\n🌐 Login URL: http://localhost:5173/login');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();
