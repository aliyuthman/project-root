import { Router } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { transactions, dataPlans, dataProviders, providerPlanMappings } from '../db/schema';
import { gladTidingsService } from '../services/gladtidings';

const router = Router();

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { phone_number, network, data_plan_id, amount } = req.body;

    // Basic validation
    if (!phone_number || !network || !data_plan_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate network
    const validNetworks = ['mtn', 'airtel', 'glo', '9mobile'];
    if (!validNetworks.includes(network.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid network' });
    }

    // Validate phone number format (Nigerian numbers)
    const phoneRegex = /^(\+234|234|0)(70|80|81|90|91)[0-9]{8}$/;
    if (!phoneRegex.test(phone_number.replace(/\s+/g, ''))) {
      return res.status(400).json({ error: 'Invalid Nigerian phone number' });
    }

    // Get data plan details
    const [dataPlan] = await db
      .select()
      .from(dataPlans)
      .where(eq(dataPlans.id, data_plan_id))
      .limit(1);

    if (!dataPlan) {
      return res.status(404).json({ error: 'Data plan not found' });
    }

    if (!dataPlan.is_available) {
      return res.status(400).json({ error: 'Data plan is currently unavailable' });
    }

    // Create transaction
    const [transaction] = await db.insert(transactions).values({
      phone_number: phone_number.replace(/\s+/g, ''),
      network: network.toLowerCase(),
      data_plan_id: dataPlan.id,
      data_plan_name: dataPlan.plan_name,
      amount: amount.toString(),
      status: 'pending'
    }).returning();

    res.json({
      id: transaction.id,
      phone_number: transaction.phone_number,
      network: transaction.network,
      data_plan_name: transaction.data_plan_name,
      amount: transaction.amount,
      status: transaction.status,
      created_at: transaction.created_at
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// GET /api/transactions/:id/status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [transaction] = await db.select({
      id: transactions.id,
      status: transactions.status,
      phone_number: transactions.phone_number,
      network: transactions.network,
      data_plan_name: transactions.data_plan_name,
      amount: transactions.amount,
      payment_reference: transactions.payment_reference,
      provider_reference: transactions.provider_reference,
      created_at: transactions.created_at,
      updated_at: transactions.updated_at
    }).from(transactions).where(eq(transactions.id, id));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    res.status(500).json({ error: 'Failed to fetch transaction status' });
  }
});

// POST /api/transactions/:id/purchase-data
router.post('/:id/purchase-data', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get transaction details
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Transaction is not in pending status',
        current_status: transaction.status 
      });
    }

    // Get data plan details and provider mapping
    const [planWithMapping] = await db
      .select({
        dataPlan: dataPlans,
        provider: dataProviders,
        mapping: providerPlanMappings
      })
      .from(dataPlans)
      .innerJoin(providerPlanMappings, eq(dataPlans.id, providerPlanMappings.data_plan_id))
      .innerJoin(dataProviders, eq(providerPlanMappings.data_provider_id, dataProviders.id))
      .where(eq(dataPlans.id, transaction.data_plan_id))
      .limit(1);

    if (!planWithMapping || planWithMapping.provider.name !== 'gladtidings') {
      return res.status(400).json({ error: 'GladTidings provider not configured for this plan' });
    }

    if (!planWithMapping.provider.is_active) {
      return res.status(503).json({ error: 'Data provider is currently unavailable' });
    }

    // Update transaction status to processing
    await db
      .update(transactions)
      .set({ 
        status: 'processing',
        data_provider_id: planWithMapping.provider.id,
        updated_at: new Date()
      })
      .where(eq(transactions.id, id));

    try {
      // Call GladTidings API to purchase data
      const gladTidingsResponse = await gladTidingsService.purchaseData({
        network: transaction.network,
        phoneNumber: transaction.phone_number,
        planId: parseInt(planWithMapping.mapping.provider_plan_id),
        transactionId: transaction.id,
        portedNumber: true // Default to true as per GladTidings example
      });

      // Update transaction with success details
      await db
        .update(transactions)
        .set({
          status: 'completed',
          provider_reference: gladTidingsResponse.id.toString(),
          provider_response: gladTidingsResponse,
          updated_at: new Date()
        })
        .where(eq(transactions.id, id));

      res.json({
        success: true,
        transaction_id: id,
        status: 'completed',
        provider_reference: gladTidingsResponse.id.toString(),
        message: 'Data purchase completed successfully',
        provider_response: {
          status: gladTidingsResponse.Status,
          api_response: gladTidingsResponse.api_response,
          balance_after: gladTidingsResponse.balance_after,
          create_date: gladTidingsResponse.create_date
        }
      });

    } catch (purchaseError) {
      console.error('GladTidings purchase failed:', purchaseError);
      
      // Update transaction status to failed
      await db
        .update(transactions)
        .set({
          status: 'failed',
          provider_response: { error: purchaseError instanceof Error ? purchaseError.message : String(purchaseError) },
          updated_at: new Date()
        })
        .where(eq(transactions.id, id));

      res.status(502).json({
        success: false,
        transaction_id: id,
        status: 'failed',
        error: 'Data purchase failed',
        message: purchaseError instanceof Error ? purchaseError.message : 'Unknown error occurred'
      });
    }

  } catch (error) {
    console.error('Error processing data purchase:', error);
    
    // Try to update transaction status to failed if possible
    try {
      await db
        .update(transactions)
        .set({
          status: 'failed',
          provider_response: { error: error instanceof Error ? error.message : String(error) },
          updated_at: new Date()
        })
        .where(eq(transactions.id, req.params.id));
    } catch (updateError) {
      console.error('Failed to update transaction status:', updateError);
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to process data purchase',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/transactions/:id/retry-data-purchase
router.post('/:id/retry-data-purchase', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get transaction details
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'failed' && transaction.status !== 'payment_completed') {
      return res.status(400).json({ 
        error: 'Transaction cannot be retried',
        current_status: transaction.status 
      });
    }

    // Import data purchase service here to avoid circular dependency
    const { dataPurchaseService } = await import('../services/dataPurchase');
    
    const result = await dataPurchaseService.retryDataPurchase(id);

    if (result.success) {
      res.json({
        success: true,
        transaction_id: id,
        status: 'completed',
        provider_reference: result.providerReference,
        message: 'Data purchase retry successful'
      });
    } else {
      res.status(400).json({
        success: false,
        transaction_id: id,
        error: result.error,
        can_retry: result.shouldRetry,
        message: 'Data purchase retry failed'
      });
    }

  } catch (error) {
    console.error('Error retrying data purchase:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retry data purchase',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;