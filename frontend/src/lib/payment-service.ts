import { BACKEND_CONFIG } from './config';

export interface CreateTransactionRequest {
  phone_number: string;
  network: string;
  data_plan_id: string;
  data_plan_name?: string;
  amount: number;
}

export interface CreateTransactionResponse {
  id: string;
  phone_number: string;
  network: string;
  data_plan_id: string;
  data_plan_name: string | null;
  amount: string;
  status: string;
  created_at: string;
}

export interface InitializePaymentRequest {
  transaction_id: string;
  customer_email: string;
  customer_name: string;
}

export interface InitializePaymentResponse {
  payment_url: string;
  payment_reference: string;
  ercaspay_reference: string;
  amount: string;
  currency: string;
}

export interface TransactionStatus {
  id: string;
  status: string;
  amount: string;
  phone_number: string;
  network: string;
  data_plan_name: string | null;
  payment_reference: string | null;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.url;
  }

  async createTransaction(data: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const response = await fetch(`${this.baseUrl}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }

    return response.json();
  }

  async initializePayment(data: InitializePaymentRequest): Promise<InitializePaymentResponse> {
    const response = await fetch(`${this.baseUrl}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize payment');
    }

    return response.json();
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    const response = await fetch(`${this.baseUrl}/api/transactions/${transactionId}/status`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get transaction status');
    }

    return response.json();
  }

  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }
}

export const paymentService = new PaymentService();
export default paymentService;