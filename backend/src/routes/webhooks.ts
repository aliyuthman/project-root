import { Router } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { transactions, payments, webhooks } from '../db/schema';
import ercasPayService from '../services/ercaspay';
import { dataPurchaseService } from '../services/dataPurchase';

const router = Router();

// POST /api/webhooks/ercaspay
router.post('/ercaspay', async (req, res) => {
  try {
    console.log('ErcasPay webhook received:', req.body);
    
    // Verify webhook (basic implementation for now)
    const signature = req.headers['x-ercaspay-signature'] as string;
    const isValid = ercasPayService.verifyWebhookSignature(JSON.stringify(req.body), signature);
    
    if (!isValid) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse webhook payload
    const webhookData = ercasPayService.parseWebhookPayload(req.body);
    
    // Store webhook in database
    await db.insert(webhooks).values({
      source: 'ercaspay',
      event_type: req.body.event || 'payment_update',
      reference_id: webhookData.transactionReference,
      payload: req.body,
      status: 'received'
    });

    // Find payment record
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.ercaspay_reference, webhookData.transactionReference));

    if (!payment) {
      console.warn('Payment not found for reference:', webhookData.transactionReference);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    const paymentStatus = webhookData.paymentStatus.toLowerCase();
    const newStatus = paymentStatus === 'successful' ? 'completed' : 
                     paymentStatus === 'failed' ? 'failed' : 'pending';

    await db.update(payments)
      .set({ 
        status: newStatus,
        payment_method: webhookData.paymentMethod
      })
      .where(eq(payments.id, payment.id));

    // Update transaction status
    const transactionStatus = newStatus === 'completed' ? 'payment_completed' : 
                              newStatus === 'failed' ? 'payment_failed' : 'pending';

    await db.update(transactions)
      .set({ 
        status: transactionStatus,
        updated_at: new Date()
      })
      .where(eq(transactions.id, payment.transaction_id));

    // If payment is successful, trigger data purchase
    if (newStatus === 'completed') {
      console.log(`[Webhook] Payment successful for transaction ${payment.transaction_id}, triggering data purchase`);
      
      // Process data purchase asynchronously (don't wait for it to complete)
      dataPurchaseService.processDataPurchase(payment.transaction_id)
        .then(result => {
          if (result.success) {
            console.log(`[Webhook] Data purchase successful for transaction ${payment.transaction_id}`);
          } else {
            console.error(`[Webhook] Data purchase failed for transaction ${payment.transaction_id}:`, result.error);
            
            // TODO: Implement retry logic or alert system for failed data purchases
            if (result.shouldRetry) {
              console.log(`[Webhook] Data purchase can be retried for transaction ${payment.transaction_id}`);
            }
          }
        })
        .catch(error => {
          console.error(`[Webhook] Unexpected error during data purchase for transaction ${payment.transaction_id}:`, error);
        });
    }

    // Mark webhook as processed
    await db.update(webhooks)
      .set({ status: 'processed' })
      .where(eq(webhooks.reference_id, webhookData.transactionReference));

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error processing ErcasPay webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/webhooks/gladtidings
router.post('/gladtidings', async (req, res) => {
  try {
    console.log('GladTidings webhook received:', req.body);
    
    // Store webhook in database
    await db.insert(webhooks).values({
      source: 'gladtidings',
      event_type: req.body.event || 'data_delivery',
      reference_id: req.body.reference || req.body.transaction_id,
      payload: req.body,
      status: 'received'
    });

    // Process data delivery status update
    const reference = req.body.reference || req.body.transaction_id;
    const status = req.body.status?.toLowerCase();

    if (reference) {
      // Update transaction with provider reference and status
      const transactionStatus = status === 'successful' || status === 'completed' ? 'completed' : 
                               status === 'failed' ? 'failed' : 'processing';
      
      await db.update(transactions)
        .set({ 
          provider_reference: reference,
          status: transactionStatus,
          provider_response: req.body, // Store the full webhook payload
          updated_at: new Date()
        })
        .where(eq(transactions.provider_reference, reference));
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error processing GladTidings webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;