import mongoose from 'mongoose';
import Category from '../models/Category.js';

export const migrateCategories = async () => {
  try {
    console.log('Starting category migration/seeding...');

    const defaultCategories = [
      'Home Injections',
      'IV Drip Services',
      'Wound Dressing',
      'Day Care at Home',
      'Patient Monitoring',
      'Old Age Patient Care',
      '24 HR Patient Care',
      'Field Survey Service',
      'Data Collection Service',
      'Field Sample Collection',
      'Community Survey',
      'Awareness Activities',
      'Lab-based Training',
      'BSC/MSC Training',
      'DMLT Training',
      'Nursing Training',
      'Dissertation Program',
      'Placement Services',
      'Blood Collection',
      'BP/Sugar Monitoring',
      'ECG at Home',
      'Catheter Care',
      'Physiotherapy Session',
      'Other'
    ];

    // 1. Seed Categories
    const categoryMap = {};
    for (const catName of defaultCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = await Category.create({ name: catName });
        console.log(`Created category: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    // 2. Fetch all existing categories to handle any other existing categories
    const allCategories = await Category.find({});
    for (const cat of allCategories) {
      categoryMap[cat.name] = cat._id;
    }

    // 3. Migrate Services (using raw collection to avoid Mongoose CastErrors on string categories)
    const servicesCollection = mongoose.connection.db.collection('services');
    const services = await servicesCollection.find({}).toArray();

    let migratedCount = 0;
    for (const service of services) {
      const currentCategory = service.category;
      if (typeof currentCategory === 'string') {
        // If it's a string, it might be a category name or a string representation of ObjectId
        let targetId = categoryMap[currentCategory];

        if (!targetId && mongoose.Types.ObjectId.isValid(currentCategory)) {
          // It's a valid ObjectId string, but not in our seeded map, check if it exists in Category DB
          const exists = await Category.findById(currentCategory);
          if (exists) {
            targetId = new mongoose.Types.ObjectId(currentCategory);
          }
        }

        if (!targetId) {
          // If it's a string name that wasn't in default list, create a category for it
          let category = await Category.findOne({ name: currentCategory });
          if (!category) {
            category = await Category.create({ name: currentCategory });
            console.log(`Created new category on-the-fly for service: ${currentCategory}`);
          }
          targetId = category._id;
          categoryMap[currentCategory] = targetId;
        }

        // Update the service with the ObjectId reference
        await servicesCollection.updateOne(
          { _id: service._id },
          { $set: { category: targetId } }
        );
        migratedCount++;
        console.log(`Migrated service "${service.serviceName}" category from string "${currentCategory}" to ObjectId "${targetId}"`);
      }
    }

    console.log(`Category migration finished. Total services migrated: ${migratedCount}`);
  } catch (error) {
    console.error('Error during category migration:', error);
  }
};
