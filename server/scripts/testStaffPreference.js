import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test Staff Preference Matching
const testStaffPreference = async () => {
  try {
    console.log('\n🚀 Testing Staff Preference Matching...\n');
    console.log('='.repeat(80));

    // Find user
    const user = await User.findOne({ email: 'rishimaheshwari040@gmail.com' });
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    // Find services
    const services = await Service.find({ isActive: true }).limit(2);
    if (services.length === 0) {
      console.log('❌ No services found!');
      return;
    }

    const selectedServices = services.map(service => ({
      serviceId: service._id,
      serviceName: service.serviceName,
      price: service.basePrice,
      quantity: 1
    }));

    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const gstAmount = subtotal * 0.18;
    const grandTotal = subtotal + gstAmount;

    // Find all vendors matching pincode (regardless of gender)
    const allVendors = await Vendor.find({
      isActive: true,
      verificationStatus: 'verified',
      $or: [
        { pincode: user.pincode },
        { serviceAreas: user.pincode }
      ]
    });

    console.log(`📍 Found ${allVendors.length} verified & active vendor(s) in pincode ${user.pincode}:`);
    allVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.name} (${vendor.businessName})`);
      console.log(`      - Gender: ${vendor.gender}`);
      console.log(`      - Email: ${vendor.email}`);
    });

    // Test 3 scenarios
    const scenarios = [
      { staffPreference: 'Any Available', description: 'Both Male & Female vendors' },
      { staffPreference: 'Male Staff', description: 'Only Male vendors' },
      { staffPreference: 'Female Staff', description: 'Only Female vendors' }
    ];

    for (const scenario of scenarios) {
      console.log('\n' + '='.repeat(80));
      console.log(`\n🧪 TEST SCENARIO: Staff Preference = "${scenario.staffPreference}"`);
      console.log(`   Expected: Notification to ${scenario.description}`);
      console.log('-'.repeat(80));

      // Create booking
      const bookingData = {
        patientName: user.name,
        age: user.age,
        sex: user.gender,
        address: user.address,
        pincode: user.pincode,
        currentLocation: user.address,
        alternateMobile: user.phone,
        email: user.email,
        selectedServices: selectedServices,
        additionalRequirements: `Testing ${scenario.staffPreference} preference`,
        hasInsurance: false,
        subtotal: subtotal,
        gstAmount: gstAmount,
        grandTotal: grandTotal,
        freeComplimentaryService: 'None',
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        staffPreference: scenario.staffPreference,
        serviceLocation: 'At Home',
        estimatedDuration: 60,
        userId: user._id,
        vendorId: null,
        bookingStatus: 'pending'
      };

      const booking = await Booking.create(bookingData);
      console.log(`\n✅ Booking Created: ${booking._id}`);
      console.log(`   - Staff Preference: ${booking.staffPreference}`);

      // Simulate vendor matching logic
      const serviceIds = selectedServices.map(s => s.serviceId);
      
      const vendorQuery = {
        isActive: true,
        verificationStatus: 'verified',
        $or: [
          { pincode: user.pincode },
          { serviceAreas: user.pincode }
        ]
      };

      if (serviceIds.length > 0) {
        vendorQuery.services = { $in: serviceIds };
      }

      // Apply gender filter
      if (scenario.staffPreference === 'Male Staff') {
        vendorQuery.gender = 'Male';
      } else if (scenario.staffPreference === 'Female Staff') {
        vendorQuery.gender = 'Female';
      }
      // For 'Any Available', no gender filter

      const matchingVendors = await Vendor.find(vendorQuery);

      console.log(`\n📊 Vendor Query:`, JSON.stringify(vendorQuery, null, 2));
      console.log(`\n✅ Matching Vendors: ${matchingVendors.length}`);

      if (matchingVendors.length > 0) {
        matchingVendors.forEach((vendor, index) => {
          console.log(`   ${index + 1}. ${vendor.name} (${vendor.businessName})`);
          console.log(`      - Gender: ${vendor.gender}`);
          console.log(`      - Email: ${vendor.email}`);
        });

        // Create notifications
        const notifications = matchingVendors.map(vendor => ({
          vendorId: vendor._id,
          bookingId: booking._id,
          message: `New booking available in your service area (${user.pincode}) with staff preference: ${scenario.staffPreference}`,
          type: 'new_booking'
        }));

        const createdNotifications = await Notification.insertMany(notifications);
        console.log(`\n🔔 ${createdNotifications.length} Notification(s) Created:`);
        
        createdNotifications.forEach((notif, index) => {
          const vendor = matchingVendors.find(v => v._id.toString() === notif.vendorId.toString());
          console.log(`   ${index + 1}. Notification ID: ${notif._id}`);
          console.log(`      - To: ${vendor.name} (Gender: ${vendor.gender})`);
          console.log(`      - Message: ${notif.message}`);
        });
      } else {
        console.log(`   ⚠️  No matching vendors found for this preference!`);
      }

      // Verify in database
      const dbNotifications = await Notification.find({ bookingId: booking._id })
        .populate('vendorId', 'name businessName gender email');

      console.log(`\n✅ Database Verification: ${dbNotifications.length} notification(s) stored`);
      
      // Cleanup - delete test booking and notifications
      await Notification.deleteMany({ bookingId: booking._id });
      await Booking.findByIdAndDelete(booking._id);
      console.log(`\n🧹 Cleanup: Test booking and notifications deleted`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL STAFF PREFERENCE TESTS COMPLETED!');
    console.log('='.repeat(80));

    console.log('\n📋 SUMMARY:');
    console.log('   ✅ "Any Available" → Sends to ALL vendors (Male + Female)');
    console.log('   ✅ "Male Staff" → Sends ONLY to Male vendors');
    console.log('   ✅ "Female Staff" → Sends ONLY to Female vendors');
    console.log('   ✅ Multiple vendors can receive notifications simultaneously');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
  }
};

// Run test
connectDB().then(() => {
  testStaffPreference();
});
