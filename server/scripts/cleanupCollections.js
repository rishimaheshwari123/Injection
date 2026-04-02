import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\nTotal collections: ${collections.length}`);
    console.log('\nCollections list:');
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });

    // Keep only these collections
    const keepCollections = [
      'users',
      'vendors',
      'services',
      'bookings',
      'labpartners',
      'insuranceclaims'
    ];

    console.log('\n\nStarting cleanup...');
    let deletedCount = 0;

    for (const collection of collections) {
      const collectionName = collection.name.toLowerCase();
      
      // Skip system collections and collections we want to keep
      if (collectionName.startsWith('system.') || 
          keepCollections.includes(collectionName)) {
        console.log(`✓ Keeping: ${collection.name}`);
        continue;
      }

      // Delete the collection
      try {
        await db.dropCollection(collection.name);
        console.log(`✗ Deleted: ${collection.name}`);
        deletedCount++;
      } catch (error) {
        console.log(`⚠ Could not delete: ${collection.name} - ${error.message}`);
      }
    }

    console.log(`\n\nCleanup complete!`);
    console.log(`Deleted ${deletedCount} collections`);
    console.log(`Remaining collections: ${collections.length - deletedCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupCollections();
