/**
 * End-to-End Payment Flow Test Script
 * Tests the complete payment-to-data-purchase workflow
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { db } from './db/connection';
import { transactions, payments, dataPlans } from './db/schema';
import { eq } from 'drizzle-orm';
import { dataPurchaseService } from './services/dataPurchase';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;

interface TestTransaction {
  id: string;
  phone_number: string;
  network: string;
  data_plan_id: string;
  amount: string;
  status: string;
}

class PaymentFlowTester {
  async runTests() {
    console.log('🧪 Starting End-to-End Payment Flow Tests\n');

    try {
      // Test 1: Get available data plans
      console.log('1. 📋 Testing data plans endpoint...');
      const plansResponse = await this.getDataPlans('mtn');
      console.log(`   ✅ Found ${plansResponse.plans.length} MTN plans`);

      if (plansResponse.plans.length === 0) {
        throw new Error('No data plans found. Run database seeding first.');
      }

      const testPlan = plansResponse.plans[0];
      console.log(`   📦 Using plan: ${testPlan.plan_name} - ₦${testPlan.price}`);

      // Test 2: Create transaction
      console.log('\n2. 💳 Testing transaction creation...');
      const transaction = await this.createTransaction({
        phone_number: '08012345678',
        network: 'mtn',
        data_plan_id: testPlan.id,
        amount: parseFloat(testPlan.price)
      });
      console.log(`   ✅ Transaction created: ${transaction.id}`);

      // Test 3: Initialize payment
      console.log('\n3. 💸 Testing payment initialization...');
      const paymentInit = await this.initializePayment({
        transaction_id: transaction.id,
        customer_email: 'test@example.com',
        customer_name: 'Test User'
      });
      console.log(`   ✅ Payment initialized: ${paymentInit.payment_reference}`);

      // Test 4: Simulate successful payment webhook
      console.log('\n4. 🔔 Testing payment webhook simulation...');
      const webhookResult = await this.simulatePaymentWebhook(paymentInit);
      console.log(`   ✅ Webhook processed: ${webhookResult.status}`);

      // Test 5: Verify transaction status
      console.log('\n5. 🔍 Testing transaction status check...');
      await this.waitForDataProcessing(transaction.id);

      // Test 6: Check final status
      const finalStatus = await this.getTransactionStatus(transaction.id);
      console.log(`   📊 Final transaction status: ${finalStatus.status}`);

      if (finalStatus.status === 'completed') {
        console.log(`   🎉 Data purchase successful! Provider reference: ${finalStatus.provider_reference}`);
      } else if (finalStatus.status === 'failed') {
        console.log(`   ❌ Data purchase failed. Testing retry...`);
        await this.testRetryFunctionality(transaction.id);
      }

      console.log('\n🏁 End-to-End Test Results:');
      console.log('   ✅ Transaction creation: PASS');
      console.log('   ✅ Payment initialization: PASS');
      console.log('   ✅ Webhook processing: PASS');
      console.log(`   ${finalStatus.status === 'completed' ? '✅' : '❌'} Data purchase: ${finalStatus.status === 'completed' ? 'PASS' : 'FAIL'}`);

    } catch (error) {
      console.error('\n❌ Test failed:', error);
      throw error;
    }
  }

  async getDataPlans(network: string) {
    const response = await axios.get(`${BASE_URL}/api/data-plans/${network}`);
    return response.data;
  }

  async createTransaction(data: {
    phone_number: string;
    network: string;
    data_plan_id: string;
    amount: number;
  }): Promise<TestTransaction> {
    const response = await axios.post(`${BASE_URL}/api/transactions`, data);
    return response.data;
  }

  async initializePayment(data: {
    transaction_id: string;
    customer_email: string;
    customer_name: string;
  }) {
    const response = await axios.post(`${BASE_URL}/api/payments/initialize`, data);
    return response.data;
  }

  async simulatePaymentWebhook(paymentData: any) {
    // Simulate ErcasPay webhook payload
    const webhookPayload = {
      transactionReference: paymentData.ercaspay_reference,
      paymentReference: paymentData.payment_reference,
      amount: parseFloat(paymentData.amount),
      currency: 'NGN',
      paymentMethod: 'card',
      paymentStatus: 'successful',
      transactionStatus: 'successful',
      paidAt: new Date().toISOString(),
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerPhoneNumber: '08012345678'
    };

    const response = await axios.post(`${BASE_URL}/api/webhooks/ercaspay`, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-ercaspay-signature': 'test-signature'
      }
    });

    return response.data;
  }

  async getTransactionStatus(transactionId: string) {
    const response = await axios.get(`${BASE_URL}/api/transactions/${transactionId}/status`);
    return response.data;
  }

  async waitForDataProcessing(transactionId: string, maxWaitTime = 30000) {
    console.log('   ⏳ Waiting for data processing...');
    
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTransactionStatus(transactionId);
      
      if (status.status === 'completed' || status.status === 'failed') {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
  }

  async testRetryFunctionality(transactionId: string) {
    console.log('   🔄 Testing retry functionality...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/transactions/${transactionId}/retry-data-purchase`);
      console.log(`   ✅ Retry result: ${response.data.success ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log('   ❌ Retry failed:', error);
    }
  }

  // Test data purchase service directly
  async testDataPurchaseService() {
    console.log('\n🔧 Testing Data Purchase Service directly...\n');

    try {
      // Find a test transaction
      const [testTransaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.status, 'payment_completed'))
        .limit(1);

      if (!testTransaction) {
        console.log('   ⚠️  No test transaction found with payment_completed status');
        return;
      }

      console.log(`   🔍 Testing with transaction: ${testTransaction.id}`);
      
      const result = await dataPurchaseService.processDataPurchase(testTransaction.id);
      
      if (result.success) {
        console.log('   ✅ Direct service test: SUCCESS');
        console.log(`   📄 Provider reference: ${result.providerReference}`);
      } else {
        console.log('   ❌ Direct service test: FAILED');
        console.log(`   💬 Error: ${result.error}`);
        console.log(`   🔄 Can retry: ${result.shouldRetry}`);
      }

    } catch (error) {
      console.error('   ❌ Service test error:', error);
    }
  }
}

// Database connectivity test
async function testDatabaseConnection() {
  try {
    const [plan] = await db.select().from(dataPlans).limit(1);
    console.log('✅ Database connection: OK');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Payment Flow Integration Tests\n');
  console.log('='.repeat(50));

  // Pre-flight checks
  console.log('📋 Pre-flight checks...');
  
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('❌ Database connection failed. Exiting.');
    process.exit(1);
  }

  const envCheck = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
    GLADTIDINGS_API_KEY: process.env.GLADTIDINGS_API_KEY ? 'Set' : 'Missing',
    ERCASPAY_SANDBOX_SECRET_KEY: process.env.ERCASPAY_SANDBOX_SECRET_KEY ? 'Set' : 'Missing'
  };

  console.log('🔧 Environment variables:', envCheck);
  console.log('');

  const tester = new PaymentFlowTester();

  try {
    // Test the service directly first
    await tester.testDataPurchaseService();

    // Then test the full flow (requires server to be running)
    if (process.argv.includes('--full-flow')) {
      console.log('🌐 Note: Full flow test requires the server to be running on port', process.env.PORT || 3001);
      await tester.runTests();
    } else {
      console.log('💡 To run full flow tests, use: npm run test:payment-flow -- --full-flow');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { PaymentFlowTester, runAllTests };