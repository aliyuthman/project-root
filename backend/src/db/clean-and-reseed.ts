import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { db } from './connection';
import { 
  dataProviders, 
  dataPlans, 
  providerPlanMappings, 
  transactions, 
  payments, 
  webhooks 
} from './schema';
import { seedDatabase } from './seed';

async function cleanAndReseedDatabase() {
  console.log('🧹 Starting database cleanup and reseeding...');
  
  try {
    // 1. Delete all data from tables (in correct order due to foreign keys)
    console.log('🗑️  Deleting existing data...');
    
    await db.delete(webhooks);
    console.log('   ✅ Cleared webhooks table');
    
    await db.delete(payments);
    console.log('   ✅ Cleared payments table');
    
    await db.delete(transactions);
    console.log('   ✅ Cleared transactions table');
    
    await db.delete(providerPlanMappings);
    console.log('   ✅ Cleared provider_plan_mappings table');
    
    await db.delete(dataPlans);
    console.log('   ✅ Cleared data_plans table');
    
    await db.delete(dataProviders);
    console.log('   ✅ Cleared data_providers table');
    
    console.log('🎯 Database cleanup completed successfully!');
    console.log('');
    
    // 2. Run fresh seeding
    console.log('🌱 Running fresh database seeding...');
    await seedDatabase();
    
    console.log('');
    console.log('✨ Clean and reseed completed successfully!');
    console.log('📊 Your database now has clean, unique data with no duplicates.');
    
  } catch (error) {
    console.error('❌ Error during clean and reseed:', error);
    throw error;
  }
}

// Run cleanup and reseeding if this file is executed directly
if (require.main === module) {
  cleanAndReseedDatabase()
    .then(() => {
      console.log('🎉 Clean and reseed process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Clean and reseed process failed:', error);
      process.exit(1);
    });
}

export { cleanAndReseedDatabase };