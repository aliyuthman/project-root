import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { db } from './connection';
import {
  dataProviders,
  dataPlans,
  providerPlanMappings,
  type NewDataProvider,
  type NewDataPlan,
  type NewProviderPlanMapping
} from './schema';

// GladTidings data plans from your CSV data
const gladTidingsPlansData = [
  // MTN Plans
  { id: '167', network: 'mtn', plan_type: 'SME', data_amount: '2 GB', validity: '30 days', original_amount: 1448.00, api_amount: 1448.00, resell_amount: 1498.00 },
  { id: '168', network: 'mtn', plan_type: 'SME', data_amount: '3.5 GB', validity: '30 days', original_amount: 2412.00, api_amount: 2407.00, resell_amount: 2457.00 },
  { id: '169', network: 'mtn', plan_type: 'SME', data_amount: '6 GB', validity: '7 days', original_amount: 2412.00, api_amount: 2412.00, resell_amount: 2462.00 },
  { id: '486', network: 'mtn', plan_type: 'SME', data_amount: '1 GB', validity: '7 days', original_amount: 750.00, api_amount: 620.00, resell_amount: 670.00 },
  { id: '506', network: 'mtn', plan_type: 'SME', data_amount: '2 GB', validity: '7 days', original_amount: 2400.00, api_amount: 2400.00, resell_amount: 2450.00 },
  { id: '528', network: 'mtn', plan_type: 'SME', data_amount: '500 MB', validity: '7 days', original_amount: 485.00, api_amount: 480.00, resell_amount: 530.00 },
  { id: '539', network: 'mtn', plan_type: 'SME', data_amount: '10 GB', validity: '30 days', original_amount: 4943.00, api_amount: 4943.00, resell_amount: 4993.00 },
  { id: '649', network: 'mtn', plan_type: 'SME', data_amount: '1 GB', validity: '30 days', original_amount: 750.00, api_amount: 740.00, resell_amount: 790.00 },
  
  // GLO Plans
  { id: '491', network: 'glo', plan_type: 'SME', data_amount: '750 MB', validity: '1 day', original_amount: 196.00, api_amount: 196.00, resell_amount: 246.00 },
  { id: '492', network: 'glo', plan_type: 'SME', data_amount: '1.5 GB', validity: '1 day', original_amount: 290.00, api_amount: 290.00, resell_amount: 340.00 },
  { id: '493', network: 'glo', plan_type: 'SME', data_amount: '2.5 GB', validity: '2 days', original_amount: 478.00, api_amount: 478.00, resell_amount: 528.00 },
  { id: '494', network: 'glo', plan_type: 'SME', data_amount: '10 GB', validity: '7 days', original_amount: 1888.00, api_amount: 1888.00, resell_amount: 1938.00 },
  
  // AIRTEL Plans
  { id: '476', network: 'airtel', plan_type: 'SME', data_amount: '150 MB', validity: '1 day', original_amount: 58.00, api_amount: 55.00, resell_amount: 105.00 },
  { id: '477', network: 'airtel', plan_type: 'SME', data_amount: '300 MB', validity: '2 days', original_amount: 105.00, api_amount: 100.00, resell_amount: 150.00 },
  { id: '478', network: 'airtel', plan_type: 'SME', data_amount: '600 MB', validity: '2 days', original_amount: 210.00, api_amount: 205.00, resell_amount: 255.00 },
  { id: '481', network: 'airtel', plan_type: 'SME', data_amount: '3 GB', validity: '2 days', original_amount: 980.00, api_amount: 980.00, resell_amount: 1030.00 },
  { id: '482', network: 'airtel', plan_type: 'SME', data_amount: '7 GB', validity: '7 days', original_amount: 2010.00, api_amount: 2010.00, resell_amount: 2060.00 },
  { id: '483', network: 'airtel', plan_type: 'SME', data_amount: '10 GB', validity: '30 days', original_amount: 3010.00, api_amount: 3010.00, resell_amount: 3060.00 },
  { id: '534', network: 'airtel', plan_type: 'SME', data_amount: '10 GB', validity: '30 days', original_amount: 4875.00, api_amount: 4875.00, resell_amount: 4925.00 },
  
  // 9MOBILE Plans  
  { id: '344', network: '9mobile', plan_type: 'SME', data_amount: '500 MB', validity: '30 days', original_amount: 125.00, api_amount: 120.00, resell_amount: 170.00 },
  { id: '346', network: '9mobile', plan_type: 'SME', data_amount: '3.5 GB', validity: '30 days', original_amount: 875.00, api_amount: 840.00, resell_amount: 890.00 },
  { id: '349', network: '9mobile', plan_type: 'SME', data_amount: '7 GB', validity: '30 days', original_amount: 1680.00, api_amount: 1400.00, resell_amount: 1450.00 },
  { id: '350', network: '9mobile', plan_type: 'SME', data_amount: '15 GB', validity: '30 days', original_amount: 3000.00, api_amount: 3000.00, resell_amount: 3050.00 },
  { id: '499', network: '9mobile', plan_type: 'SME', data_amount: '250 MB', validity: '14 days', original_amount: 75.00, api_amount: 75.00, resell_amount: 125.00 }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert GladTidings as data provider
    console.log('📡 Creating GladTidings data provider...');
    
    const gladTidingsProvider: NewDataProvider = {
      name: 'gladtidings',
      display_name: 'GladTidings Data',
      base_url: 'https://gladtidingsapihub.com/api/v1',
      api_key: process.env.GLADTIDINGS_API_KEY || 'your_api_key_here',
      config: {
        timeout: 30000,
        retries: 3,
        webhook_secret: process.env.GLADTIDINGS_WEBHOOK_SECRET || 'your_webhook_secret'
      },
      is_active: true,
      priority: 1 // Highest priority
    };

    const [createdProvider] = await db.insert(dataProviders)
      .values(gladTidingsProvider)
      .onConflictDoUpdate({
        target: dataProviders.name,
        set: {
          display_name: gladTidingsProvider.display_name,
          base_url: gladTidingsProvider.base_url,
          config: gladTidingsProvider.config,
          is_active: gladTidingsProvider.is_active,
          priority: gladTidingsProvider.priority,
          updated_at: new Date()
        }
      })
      .returning();

    console.log(`✅ GladTidings provider created/updated with ID: ${createdProvider.id}`);

    // 2. Insert normalized data plans
    console.log('📋 Creating normalized data plans...');
    
    const normalizedPlans: NewDataPlan[] = gladTidingsPlansData.map(plan => ({
      network: plan.network,
      plan_name: `${plan.data_amount} ${plan.plan_type}`,
      data_amount: plan.data_amount,
      price: plan.resell_amount.toString(),
      cost_price: plan.api_amount.toString(),
      validity: plan.validity,
      plan_type: plan.plan_type,
      is_available: true
    }));

    const createdPlans = await db.insert(dataPlans)
      .values(normalizedPlans)
      .onConflictDoNothing() // Skip duplicates based on unique constraints if any
      .returning();

    console.log(`✅ Created ${createdPlans.length} normalized data plans`);

    // 3. Create provider plan mappings
    console.log('🔗 Creating provider plan mappings...');
    
    const mappings: NewProviderPlanMapping[] = [];
    
    for (let i = 0; i < createdPlans.length; i++) {
      const plan = createdPlans[i];
      const originalPlan = gladTidingsPlansData[i];
      
      if (plan && originalPlan) {
        mappings.push({
          data_plan_id: plan.id,
          data_provider_id: createdProvider.id,
          provider_plan_id: originalPlan.id,
          provider_network_id: getGladTidingsNetworkId(originalPlan.network),
          provider_metadata: {
            original_amount: originalPlan.original_amount,
            api_amount: originalPlan.api_amount,
            resell_amount: originalPlan.resell_amount,
            plan_type: originalPlan.plan_type
          },
          is_active: true
        });
      }
    }

    const createdMappings = await db.insert(providerPlanMappings)
      .values(mappings)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Created ${createdMappings.length} provider plan mappings`);

    // 4. Display summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Data Providers: 1 (GladTidings)`);
    console.log(`   • Data Plans: ${createdPlans.length}`);
    console.log(`   • Provider Mappings: ${createdMappings.length}`);
    console.log('\n📱 Plans by Network:');
    
    const plansByNetwork = gladTidingsPlansData.reduce((acc, plan) => {
      acc[plan.network] = (acc[plan.network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(plansByNetwork).forEach(([network, count]) => {
      console.log(`   • ${network.toUpperCase()}: ${count} plans`);
    });

    console.log('\n🔑 Next Steps:');
    console.log('   1. Set your GLADTIDINGS_API_KEY environment variable');
    console.log('   2. Set your GLADTIDINGS_WEBHOOK_SECRET environment variable');
    console.log('   3. Test the API endpoints with the seeded data');
    console.log('   4. Run `npm run db:studio` to view data in Drizzle Studio');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Helper function to map network names to GladTidings network IDs
function getGladTidingsNetworkId(network: string): string {
  const networkMap: Record<string, string> = {
    'mtn': '1',
    'glo': '2', 
    'airtel': '3',
    '9mobile': '6'
  };
  return networkMap[network] || '1';
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };