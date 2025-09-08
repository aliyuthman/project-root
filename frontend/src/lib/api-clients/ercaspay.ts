/**
 * ErcasPay Payment Gateway Client
 * Handles all payment-related API calls to ErcasPay
 */

import { ERCASPAY_CONFIG } from '../config';

// Types for ErcasPay API
export interface PaymentInitializationRequest {
  amount: number;
  currency: string;
  paymentReference: string;
  paymentMethods: string[];
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  redirectUrl: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResponse {
  success: boolean;
  message: string;
  data: {
    checkoutUrl: string;
    paymentReference: string;
    transactionReference: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    transactionReference: string;
    paymentReference: string;
    amount: number;
    currency: string;
    status: 'pending' | 'successful' | 'failed' | 'cancelled';
    paymentMethod: string;
    paidAt?: string;
    customerName: string;
    customerEmail: string;
    customerPhoneNumber: string;
  };
}

export interface WebhookPayload {
  event: 'payment.successful' | 'payment.failed';
  data: {
    transactionReference: string;
    paymentReference: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    paidAt: string;
    customerName: string;
    customerEmail: string;
    customerPhoneNumber: string;
  };
}

class ErcasPayClient {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor() {
    const config = ERCASPAY_CONFIG.current;
    this.baseUrl = config.baseUrl;
    this.publicKey = config.publicKey;
    this.secretKey = config.secretKey;

    if (!this.publicKey || !this.secretKey) {
      throw new Error(
        `ErcasPay API keys not configured for ${ERCASPAY_CONFIG.environment} environment`
      );
    }
  }

  /**
   * Get authorization headers for API requests
   */
  private getHeaders(useSecretKey = false): Record<string, string> {
    const apiKey = useSecretKey ? this.secretKey : this.publicKey;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  /**
   * Make API request to ErcasPay
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    useSecretKey = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(useSecretKey),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ErcasPay API Error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('ErcasPay API Request Failed:', error);
      throw error;
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: PaymentInitializationRequest): Promise<PaymentInitializationResponse> {
    return this.makeRequest<PaymentInitializationResponse>(
      '/payments/initialize',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true // Use secret key for payment initialization
    );
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(paymentReference: string): Promise<PaymentVerificationResponse> {
    return this.makeRequest<PaymentVerificationResponse>(
      `/payments/verify/${paymentReference}`,
      {
        method: 'GET',
      },
      true // Use secret key for verification
    );
  }

  /**
   * Get payment status by transaction reference
   */
  async getPaymentStatus(transactionReference: string): Promise<PaymentVerificationResponse> {
    return this.makeRequest<PaymentVerificationResponse>(
      `/transactions/${transactionReference}`,
      {
        method: 'GET',
      },
      true
    );
  }

  /**
   * Validate webhook signature (for webhook endpoints)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Implementation depends on ErcasPay's webhook signature method
    // This is a placeholder - check ErcasPay documentation for exact implementation
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', ERCASPAY_CONFIG.webhook.secret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Generate a unique payment reference
   */
  generatePaymentReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Format amount for ErcasPay (convert to smallest currency unit if needed)
   */
  formatAmount(amount: number): number {
    // ErcasPay expects amount in kobo for NGN (multiply by 100)
    return Math.round(amount * 100);
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'bank_transfer',
      'ussd',
      'bank',
      'qr',
    ];
  }

  /**
   * Create payment data for transaction
   */
  createPaymentData(
    amount: number,
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    },
    metadata: {
      transactionId: string;
      network: string;
      dataPlan: string;
      phoneNumber: string;
    }
  ): PaymentInitializationRequest {
    return {
      amount: this.formatAmount(amount),
      currency: 'NGN',
      paymentReference: this.generatePaymentReference(),
      paymentMethods: this.getSupportedPaymentMethods(),
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhoneNumber: customerDetails.phone,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      description: `Data purchase: ${metadata.dataPlan} for ${metadata.network.toUpperCase()}`,
      metadata,
    };
  }
}

// Export singleton instance
export const ercasPayClient = new ErcasPayClient();

// Export types
export type { PaymentInitializationRequest, PaymentInitializationResponse, PaymentVerificationResponse, WebhookPayload };