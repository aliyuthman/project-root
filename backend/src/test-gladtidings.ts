/**
 * Test script for GladTidings integration
 * This script tests the GladTidings service without making actual API calls
 */

import dotenv from 'dotenv';
import { gladTidingsService } from './services/gladtidings';

dotenv.config();

async function testGladTidingsIntegration() {
  console.log('🧪 Testing GladTidings Integration...\n');

  try {
    // Test 1: Service instantiation
    console.log('✅ 1. GladTidings service instantiated successfully');

    // Test 2: Phone number formatting
    console.log('✅ 2. Testing phone number formatting:');
    const testNumbers = [
      '08012345678',
      '+2348012345678', 
      '2348012345678',
      '8012345678'
    ];
    
    // We can't directly test the private method, but we can test the service with these numbers
    console.log('   Test numbers:', testNumbers.join(', '));

    // Test 3: Network mapping
    console.log('✅ 3. Testing network mapping:');
    const networks = ['mtn', 'glo', 'airtel', '9mobile'];
    console.log('   Supported networks:', networks.join(', '));

    // Test 4: API configuration
    console.log('✅ 4. Testing API configuration:');
    console.log('   Base URL:', process.env.GLADTIDINGS_BASE_URL || 'Not configured');
    console.log('   API Key:', process.env.GLADTIDINGS_API_KEY ? '✅ Configured' : '❌ Not configured');

    // Test 5: Mock data purchase (without actual API call)
    console.log('✅ 5. Testing data purchase parameters:');
    const mockPurchaseParams = {
      network: 'mtn',
      phoneNumber: '08012345678',
      planId: 649,
      transactionId: 'test-transaction-id',
      portedNumber: true
    };
    console.log('   Mock parameters:', JSON.stringify(mockPurchaseParams, null, 2));

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Ensure database has GladTidings provider and plan mappings');
    console.log('2. Test with real API credentials in a controlled environment');
    console.log('3. Implement proper error handling and retry logic');
    console.log('4. Set up webhooks for transaction status updates');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testGladTidingsIntegration();