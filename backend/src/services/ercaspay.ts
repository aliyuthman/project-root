import axios from 'axios';

interface PaymentInitRequest {
  amount: number;
  currency: string;
  paymentReference: string;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  redirectUrl: string;
  description: string;
}

interface PaymentInitResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    paymentUrl: string;
    transactionReference: string;
  };
}

interface WebhookPayload {
  transactionReference: string;
  paymentReference: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionStatus: string;
  paidAt: string;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
}

class ErcasPayService {
  private baseUrl: string;
  private secretKey: string;
  private publicKey: string;

  constructor() {
    const environment = process.env.ERCASPAY_ENVIRONMENT || 'sandbox';
    
    if (environment === 'live') {
      this.baseUrl = process.env.ERCASPAY_LIVE_BASE_URL || 'https://api.ercaspay.com/api/v1';
      this.secretKey = process.env.ERCASPAY_LIVE_SECRET_KEY || '';
      this.publicKey = process.env.ERCASPAY_LIVE_PUBLIC_KEY || '';
    } else {
      this.baseUrl = process.env.ERCASPAY_SANDBOX_BASE_URL || 'https://api-staging.ercaspay.com/api/v1';
      this.secretKey = process.env.ERCASPAY_SANDBOX_SECRET_KEY || '';
      this.publicKey = process.env.ERCASPAY_SANDBOX_PUBLIC_KEY || '';
    }

    if (!this.secretKey) {
      throw new Error('ErcasPay secret key is required');
    }
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`
    };
  }

  async initiatePayment(paymentData: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment/initiate`,
        {
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentReference: paymentData.paymentReference,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          customerPhoneNumber: paymentData.customerPhoneNumber,
          redirectUrl: paymentData.redirectUrl,
          description: paymentData.description,
          paymentMethods: 'card,bank-transfer,ussd,qrcode',
          feeBearer: 'customer'
        },
        { headers: this.getHeaders() }
      );

      return {
        requestSuccessful: response.data.requestSuccessful,
        responseMessage: response.data.responseMessage,
        responseCode: response.data.responseCode,
        responseBody: {
          paymentUrl: response.data.responseBody.checkoutUrl,
          transactionReference: response.data.responseBody.transactionReference
        }
      };
    } catch (error: any) {
      console.error('ErcasPay initiate payment error:', error.response?.data || error.message);
      throw new Error(`Payment initialization failed: ${error.response?.data?.responseMessage || error.message}`);
    }
  }

  async verifyPayment(transactionReference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment/transaction/verify/${transactionReference}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('ErcasPay verify payment error:', error.response?.data || error.message);
      throw new Error(`Payment verification failed: ${error.response?.data?.responseMessage || error.message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
    const webhookSecret = process.env.ERCASPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('Webhook secret not configured, skipping signature verification');
      return true; // In development, allow requests without signature
    }
    
    if (!signature) {
      console.warn('No signature provided in webhook');
      return false;
    }
    
    try {
      const crypto = require('crypto');
      
      // ErcasPay typically uses HMAC-SHA512 for webhook signatures
      const expectedSignature = crypto
        .createHmac('sha512', webhookSecret)
        .update(payload)
        .digest('hex');
      
      // Compare signatures securely to prevent timing attacks
      const providedSignature = signature.replace('sha512=', '');
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
      
      if (!isValid) {
        console.warn('Webhook signature verification failed');
        console.log('Expected:', expectedSignature);
        console.log('Provided:', providedSignature);
      }
      
      return isValid;
      
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  parseWebhookPayload(payload: any): WebhookPayload {
    return {
      transactionReference: payload.transactionReference || payload.reference,
      paymentReference: payload.paymentReference || payload.payment_reference,
      amount: parseFloat(payload.amount),
      currency: payload.currency || 'NGN',
      paymentMethod: payload.paymentMethod || payload.payment_method,
      paymentStatus: payload.paymentStatus || payload.status,
      transactionStatus: payload.transactionStatus || payload.transaction_status,
      paidAt: payload.paidAt || payload.paid_at,
      customerName: payload.customerName || payload.customer?.name,
      customerEmail: payload.customerEmail || payload.customer?.email,
      customerPhoneNumber: payload.customerPhoneNumber || payload.customer?.phone
    };
  }
}

export default new ErcasPayService();
export type { PaymentInitRequest, PaymentInitResponse, WebhookPayload };