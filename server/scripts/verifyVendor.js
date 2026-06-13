import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Vendor from '../models/Vendor.js';

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

// Verify vendor
const verifyVendor = async () => {
  try {
    console.log('\n🚀 Verifying Vendor...\n');

    // Update the vendor to verified status
    const result = await Vendor.updateOne(
      { email: 'rishimaheshwari00@gmail.com' },
      { 
        $set: { 
          verificationStatus: 'verified',
          isVerified: true,
          verificationDate: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      const vendor = await Vendor.findOne({ email: 'rishimaheshwari00@gmail.com' });
      console.log('✅ Vendor verified successfully!');
      console.log(`   - Name: ${vendor.name}`);
      console.log(`   - Email: ${vendor.email}`);
      console.log(`   - Business: ${vendor.businessName}`);
      console.log(`   - Verification Status: ${vendor.verificationStatus}`);
      console.log(`   - Is Verified: ${vendor.isVerified}`);
      console.log(`   - Verification Date: ${vendor.verificationDate}`);
    } else {
      console.log('⚠️  No changes made (vendor might already be verified)');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run
connectDB().then(() => {
  verifyVendor();
});
