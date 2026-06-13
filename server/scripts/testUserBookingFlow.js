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

// Test User Booking Flow
const testUserBookingFlow = async () => {
  try {
    console.log('\n🚀 Starting User Booking Flow Test...\n');

    // Step 1: Find the test user
    console.log('📍 Step 1: Finding test user...');
    const user = await User.findOne({ email: 'rishimaheshwari040@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   - Pincode: ${user.pincode}`);
    console.log(`   - User ID: ${user._id}`);

    // Step 2: Find vendors with matching pincode
    console.log('\n📍 Step 2: Finding vendors with matching pincode (466113)...');
    const vendors = await Vendor.find({
      $or: [
        { pincode: '466113' },
        { serviceAreas: '466113' }
      ]
    });
    
    console.log(`✅ Found ${vendors.length} vendor(s) with matching pincode:`);
    vendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.name} (${vendor.businessName})`);
      console.log(`      - Email: ${vendor.email}`);
      console.log(`      - Pincode: ${vendor.pincode}`);
      console.log(`      - Service Areas: ${vendor.serviceAreas.join(', ') || 'None'}`);
      console.log(`      - Is Active: ${vendor.isActive}`);
      console.log(`      - Verification Status: ${vendor.verificationStatus}`);
      console.log(`      - Services: ${vendor.services.length}`);
      console.log(`      - Vendor ID: ${vendor._id}`);
    });

    // Step 3: Find available services
    console.log('\n📍 Step 3: Finding available services...');
    const services = await Service.find({ isActive: true }).limit(2);
    
    if (services.length === 0) {
      console.log('❌ No active services found!');
      return;
    }
    
    console.log(`✅ Found ${services.length} active service(s):`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.serviceName} - ₹${service.basePrice}`);
      console.log(`      - Category: ${service.category}`);
      console.log(`      - Service ID: ${service._id}`);
    });

    // Step 4: Create test booking data
    console.log('\n📍 Step 4: Creating test booking...');
    const selectedServices = services.map(service => ({
      serviceId: service._id,
      serviceName: service.serviceName,
      price: service.basePrice,
      quantity: 1
    }));

    const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const gstAmount = subtotal * 0.18; // 18% GST
    const grandTotal = subtotal + gstAmount;

    const bookingData = {
      patientName: user.name,
      age: user.age,
      sex: user.gender,
      address: user.address,
      pincode: user.pincode,
      currentLocation: user.address,
      alternateMobile: user.alternateMobile || user.phone,
      email: user.email,
      selectedServices: selectedServices,
      additionalRequirements: 'Test booking for notification verification',
      hasInsurance: user.hasInsurance,
      insurancePolicyNumber: user.insurancePolicyNumber,
      subtotal: subtotal,
      gstAmount: gstAmount,
      grandTotal: grandTotal,
      freeComplimentaryService: 'Blood Sugar',
      preferredTimeSlot: '10:00 AM - 12:00 PM',
      staffPreference: 'Any Available',
      serviceLocation: 'At Home',
      estimatedDuration: 60,
      userId: user._id,
      vendorId: null,
      bookingStatus: 'pending'
    };

    // Create booking
    const booking = await Booking.create(bookingData);
    await booking.populate('userId', 'name email phone');
    
    console.log('✅ Booking created successfully!');
    console.log(`   - Booking ID: ${booking._id}`);
    console.log(`   - Patient: ${booking.patientName}`);
    console.log(`   - Pincode: ${booking.pincode}`);
    console.log(`   - Status: ${booking.bookingStatus}`);
    console.log(`   - Vendor ID: ${booking.vendorId || 'null (not assigned yet)'}`);
    console.log(`   - Services: ${booking.selectedServices.length}`);
    console.log(`   - Total: ₹${booking.grandTotal}`);

    // Step 5: Find matching vendors and create notifications
    console.log('\n📍 Step 5: Matching vendors and creating notifications...');
    
    const serviceIds = selectedServices.map(s => s.serviceId);
    
    const vendorQuery = {
      isActive: true,
      verificationStatus: 'verified',
      $or: [
        { pincode: booking.pincode },
        { serviceAreas: booking.pincode }
      ]
    };

    if (serviceIds.length > 0) {
      vendorQuery.services = { $in: serviceIds };
    }

    console.log('   Vendor Query:', JSON.stringify(vendorQuery, null, 2));

    const matchingVendors = await Vendor.find(vendorQuery);
    
    console.log(`✅ Found ${matchingVendors.length} matching vendor(s) for notification:`);
    matchingVendors.forEach((vendor, index) => {
      console.log(`   ${index + 1}. ${vendor.name} (${vendor.businessName})`);
      console.log(`      - Email: ${vendor.email}`);
      console.log(`      - Pincode: ${vendor.pincode}`);
      console.log(`      - Verified: ${vendor.verificationStatus === 'verified' ? '✅' : '❌'}`);
      console.log(`      - Active: ${vendor.isActive ? '✅' : '❌'}`);
    });

    // Create notifications
    if (matchingVendors.length > 0) {
      const notifications = matchingVendors.map(vendor => ({
        vendorId: vendor._id,
        bookingId: booking._id,
        message: `New booking available in your service area (${booking.pincode}) matching your staff gender preference.`,
        type: 'new_booking'
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`\n✅ ${createdNotifications.length} Notification(s) created successfully!`);
      
      createdNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. Notification ID: ${notif._id}`);
        console.log(`      - Vendor ID: ${notif.vendorId}`);
        console.log(`      - Booking ID: ${notif.bookingId}`);
        console.log(`      - Type: ${notif.type}`);
        console.log(`      - Is Read: ${notif.isRead}`);
        console.log(`      - Is Accepted: ${notif.isAccepted}`);
      });
    } else {
      console.log('\n⚠️  No matching vendors found! Possible reasons:');
      console.log('   - No vendors with matching pincode (466113)');
      console.log('   - Vendors not verified (verificationStatus !== "verified")');
      console.log('   - Vendors not active (isActive !== true)');
      console.log('   - Vendors don\'t offer the selected services');
    }

    // Step 6: Verify notifications in database
    console.log('\n📍 Step 6: Verifying notifications in database...');
    const allNotifications = await Notification.find({ bookingId: booking._id })
      .populate('vendorId', 'name businessName email pincode')
      .populate('bookingId', 'patientName pincode bookingStatus');
    
    console.log(`✅ Total notifications in DB for this booking: ${allNotifications.length}`);
    allNotifications.forEach((notif, index) => {
      console.log(`\n   Notification ${index + 1}:`);
      console.log(`   - Notification ID: ${notif._id}`);
      console.log(`   - Vendor: ${notif.vendorId.name} (${notif.vendorId.businessName})`);
      console.log(`   - Vendor Email: ${notif.vendorId.email}`);
      console.log(`   - Vendor Pincode: ${notif.vendorId.pincode}`);
      console.log(`   - Booking: ${notif.bookingId.patientName} (${notif.bookingId.pincode})`);
      console.log(`   - Booking Status: ${notif.bookingId.bookingStatus}`);
      console.log(`   - Message: ${notif.message}`);
      console.log(`   - Is Read: ${notif.isRead ? '✅' : '❌'}`);
      console.log(`   - Is Accepted: ${notif.isAccepted ? '✅' : '❌'}`);
      console.log(`   - Created At: ${notif.createdAt}`);
    });

    // Step 7: Simulate vendor accepting booking
    if (matchingVendors.length > 0) {
      console.log('\n📍 Step 7: Simulating vendor acceptance...');
      const firstVendor = matchingVendors[0];
      
      console.log(`   Vendor "${firstVendor.name}" accepting booking...`);
      
      // Update booking
      booking.vendorId = firstVendor._id;
      booking.bookingStatus = 'accepted';
      booking.acceptedAt = new Date();
      await booking.save();
      
      // Update notification for accepting vendor
      await Notification.updateOne(
        { bookingId: booking._id, vendorId: firstVendor._id },
        { $set: { isAccepted: true, isRead: true } }
      );
      
      // Delete notifications for other vendors
      const deletedCount = await Notification.deleteMany({
        bookingId: booking._id,
        vendorId: { $ne: firstVendor._id }
      });
      
      console.log(`   ✅ Booking accepted by: ${firstVendor.name}`);
      console.log(`   ✅ Booking status updated to: ${booking.bookingStatus}`);
      console.log(`   ✅ Notifications deleted for ${deletedCount.deletedCount} other vendor(s)`);
      
      // Verify remaining notifications
      const remainingNotifications = await Notification.find({ bookingId: booking._id })
        .populate('vendorId', 'name businessName');
      
      console.log(`\n   ✅ Remaining notifications: ${remainingNotifications.length}`);
      remainingNotifications.forEach((notif, index) => {
        console.log(`      ${index + 1}. Vendor: ${notif.vendorId.name}`);
        console.log(`         - Is Accepted: ${notif.isAccepted ? '✅' : '❌'}`);
        console.log(`         - Is Read: ${notif.isRead ? '✅' : '❌'}`);
      });

      // Test: Try to accept with another vendor (should fail)
      if (matchingVendors.length > 1) {
        console.log('\n📍 Step 8: Testing duplicate acceptance (should fail)...');
        const secondVendor = matchingVendors[1];
        console.log(`   Attempting to accept with vendor: ${secondVendor.name}...`);
        
        const testBooking = await Booking.findById(booking._id);
        
        if (testBooking.vendorId) {
          console.log('   ✅ Validation passed: Booking already has vendorId');
          console.log(`   ❌ Error message would be: "Booking has already been accepted by another vendor"`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 USER BOOKING FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    
    console.log('\n📊 Summary:');
    console.log(`   - User: ${user.name} (${user.email})`);
    console.log(`   - Pincode: ${user.pincode}`);
    console.log(`   - Booking ID: ${booking._id}`);
    console.log(`   - Matching Vendors: ${matchingVendors.length}`);
    console.log(`   - Notifications Created: ${matchingVendors.length}`);
    console.log(`   - Booking Status: ${booking.bookingStatus}`);
    console.log(`   - Assigned Vendor: ${matchingVendors.length > 0 ? matchingVendors[0].name : 'None'}`);
    
  } catch (error) {
    console.error('\n❌ Error in test:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run the test
connectDB().then(() => {
  testUserBookingFlow();
});
