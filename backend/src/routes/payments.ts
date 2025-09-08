import { Router } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { transactions, payments } from '../db/schema';
import ercasPayService from '../services/ercaspay';

const router = Router();

// POST /api/payments/initialize
router.post('/initialize', async (req, res) => {
  try {
    const { transaction_id, customer_email, customer_name } = req.body;

    // Basic validation
    if (!transaction_id || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get transaction details
    const [transaction] = await db.select()
      .from(transactions)
      .where(eq(transactions.id, transaction_id));

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not in pending status' });
    }

    // Generate payment reference
    const paymentReference = `PAY_${transaction_id}_${Date.now()}`;
    
    // Initialize payment with ErcasPay
    const paymentInit = await ercasPayService.initiatePayment({
      amount: parseFloat(transaction.amount),
      currency: 'NGN',
      paymentReference,
      customerName: customer_name || 'Customer',
      customerEmail: customer_email,
      customerPhoneNumber: transaction.phone_number,
      redirectUrl: `${process.env.FRONTEND_URL}/payment/callback?reference=${paymentReference}`,
      description: `Data purchase for ${transaction.phone_number} - ${transaction.data_plan_name || 'Data Bundle'}`
    });

    if (!paymentInit.requestSuccessful) {
      return res.status(400).json({ 
        error: 'Payment initialization failed',
        message: paymentInit.responseMessage 
      });
    }

    // Create payment record
    await db.insert(payments).values({
      transaction_id: transaction.id,
      ercaspay_reference: paymentInit.responseBody.transactionReference,
      amount: transaction.amount,
      status: 'pending'
    }).returning();

    // Update transaction with payment reference
    await db.update(transactions)
      .set({ 
        payment_reference: paymentReference,
        updated_at: new Date()
      })
      .where(eq(transactions.id, transaction.id));

    res.json({
      payment_url: paymentInit.responseBody.paymentUrl,
      payment_reference: paymentReference,
      ercaspay_reference: paymentInit.responseBody.transactionReference,
      amount: transaction.amount,
      currency: 'NGN'
    });

  } catch (error: any) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ 
      error: 'Failed to initialize payment',
      message: error.message 
    });
  }
});

export default router;