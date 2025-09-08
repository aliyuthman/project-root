/**
 * GladTidingsData API Client
 * Handles all data purchase and network-related API calls
 */

import { GLADTIDINGS_CONFIG, NETWORK_CONFIG } from '../config';
import type { Network } from '../config';

// Types for GladTidingsData API
export interface DataPlan {
  id: string;
  network: Network;
  planName: string;
  dataAmount: string;
  price: number;
  validity: string;
  planType: 'daily' | 'weekly' | 'monthly';
  isAvailable: boolean;
  description?: string;
}

export interface DataPurchaseRequest {
  network: Network;
  planId: string;
  phoneNumber: string;
  amount: number;
  transactionReference: string;
}

export interface DataPurchaseResponse {
  success: boolean;
  message: string;
  data: {
    transactionReference: string;
    gladtidingsReference: string;
    network: Network;
    phoneNumber: string;
    amount: number;
    dataAmount: string;
    status: 'pending' | 'processing' | 'successful' | 'failed';
    deliveryTime?: string;
  };
}

export interface BalanceResponse {
  success: boolean;
  data: {
    balance: number;
    currency: string;
    lastUpdated: string;
  };
}

export interface TransactionStatusResponse {
  success: boolean;
  data: {
    transactionReference: string;
    gladtidingsReference: string;
    status: 'pending' | 'processing' | 'successful' | 'failed';
    network: Network;
    phoneNumber: string;
    amount: number;
    dataAmount: string;
    purchaseDate: string;
    deliveryDate?: string;
    failureReason?: string;
  };
}

export interface NetworkStatusResponse {
  success: boolean;
  data: {
    network: Network;
    isAvailable: boolean;
    responseTime: number;
    lastChecked: string;
  }[];
}

class GladTidingsClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.baseUrl = GLADTIDINGS_CONFIG.baseUrl;
    this.apiKey = GLADTIDINGS_CONFIG.apiKey;
    this.apiSecret = GLADTIDINGS_CONFIG.apiSecret;

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('GladTidingsData API credentials not configured');
    }
  }

  /**
   * Get authorization headers for API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Secret': this.apiSecret,
    };
  }

  /**
   * Make API request to GladTidingsData
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `GladTidingsData API Error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('GladTidingsData API Request Failed:', error);
      throw error;
    }
  }

  /**
   * Get available data plans for a specific network
   */
  async getDataPlans(network: Network): Promise<DataPlan[]> {
    const response = await this.makeRequest<{ success: boolean; data: DataPlan[] }>(
      `/data-plans/${network}`,
      {
        method: 'GET',
      }
    );

    return response.data.filter(plan => plan.isAvailable);
  }

  /**
   * Get all available data plans for all networks
   */
  async getAllDataPlans(): Promise<Record<Network, DataPlan[]>> {
    const plans: Record<Network, DataPlan[]> = {} as any;

    for (const network of NETWORK_CONFIG.supportedNetworks) {
      try {
        plans[network] = await this.getDataPlans(network);
      } catch (error) {
        console.error(`Failed to fetch plans for ${network}:`, error);
        plans[network] = [];
      }
    }

    return plans;
  }

  /**
   * Purchase data for a phone number
   */
  async purchaseData(request: DataPurchaseRequest): Promise<DataPurchaseResponse> {
    return this.makeRequest<DataPurchaseResponse>(
      '/data/purchase',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Check account balance
   */
  async getBalance(): Promise<BalanceResponse> {
    return this.makeRequest<BalanceResponse>(
      '/account/balance',
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionReference: string): Promise<TransactionStatusResponse> {
    return this.makeRequest<TransactionStatusResponse>(
      `/transactions/${transactionReference}/status`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Check network availability
   */
  async getNetworkStatus(): Promise<NetworkStatusResponse> {
    return this.makeRequest<NetworkStatusResponse>(
      '/networks/status',
      {
        method: 'GET',
      }
    );
  }

  /**
   * Validate phone number for a specific network
   */
  validatePhoneNumber(phoneNumber: string, network: Network): {
    isValid: boolean;
    error?: string;
  } {
    // Remove all non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Handle international format
    let normalizedPhone = '';
    if (cleanPhone.startsWith('234')) {
      normalizedPhone = '0' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('0')) {
      normalizedPhone = cleanPhone;
    } else {
      return {
        isValid: false,
        error: 'Phone number must start with 0, 234, or +234',
      };
    }

    // Check length
    if (normalizedPhone.length !== 11) {
      return {
        isValid: false,
        error: 'Phone number must be 11 digits long',
      };
    }

    // Check network prefix
    const prefix = normalizedPhone.slice(0, 4);
    const validPrefixes = NETWORK_CONFIG.prefixes[network];
    
    if (!validPrefixes.includes(prefix)) {
      return {
        isValid: false,
        error: `This number doesn't belong to ${network.toUpperCase()}. Valid prefixes: ${validPrefixes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Detect network from phone number
   */
  detectNetwork(phoneNumber: string): Network | null {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    let normalizedPhone = '';
    if (cleanPhone.startsWith('234')) {
      normalizedPhone = '0' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('0')) {
      normalizedPhone = cleanPhone;
    } else {
      return null;
    }

    if (normalizedPhone.length !== 11) {
      return null;
    }

    const prefix = normalizedPhone.slice(0, 4);
    
    for (const [network, prefixes] of Object.entries(NETWORK_CONFIG.prefixes)) {
      if (prefixes.includes(prefix)) {
        return network as Network;
      }
    }

    return null;
  }

  /**
   * Generate transaction reference
   */
  generateTransactionReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Format phone number to standard Nigerian format
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('234')) {
      return '0' + cleanPhone.slice(3);
    }
    
    return cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
  }

  /**
   * Check if sufficient balance is available for purchase
   */
  async checkSufficientBalance(amount: number): Promise<boolean> {
    try {
      const balanceResponse = await this.getBalance();
      return balanceResponse.data.balance >= amount;
    } catch (error) {
      console.error('Failed to check balance:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gladTidingsClient = new GladTidingsClient();

// Export types
export type {
  DataPlan,
  DataPurchaseRequest,
  DataPurchaseResponse,
  BalanceResponse,
  TransactionStatusResponse,
  NetworkStatusResponse,
};