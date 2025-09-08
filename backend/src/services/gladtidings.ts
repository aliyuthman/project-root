import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../lib/config';

// GladTidings network mapping
const NETWORK_MAPPING = {
  'mtn': 1,
  'glo': 2,
  'airtel': 3,
  '9mobile': 4
} as const;

export interface GladTidingsDataRequest {
  network: number;
  mobile_number: string;
  plan: number;
  Ported_number: boolean;
  ident?: string;
}

export interface GladTidingsDataResponse {
  id: number;
  ident: string;
  network: number;
  balance_before: string;
  payment_medium: string;
  balance_after: string;
  mobile_number: string;
  plan_type: string;
  duration: string;
  plan: number;
  client_ip: string;
  Status: string;
  api_response: string;
  plan_network: string;
  plan_name: string;
  plan_amount: string;
  create_date: string;
  Ported_number: boolean;
}

export interface GladTidingsError {
  error: string;
  message?: string;
  status?: number;
}

class GladTidingsService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.gladtidings.apiKey;
    this.baseUrl = config.gladtidings.baseUrl;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.apiKey}`, // Based on OAuth 2.0 mention in docs
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[GladTidings] Making request to ${config.url}`, {
          method: config.method,
          data: config.data ? { ...config.data, mobile_number: this.maskPhoneNumber(config.data.mobile_number || '') } : undefined
        });
        return config;
      },
      (error) => {
        console.error('[GladTidings] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[GladTidings] Response from ${response.config.url}:`, {
          status: response.status,
          data: response.data ? { ...response.data, mobile_number: this.maskPhoneNumber(response.data.mobile_number || '') } : undefined
        });
        return response;
      },
      (error) => {
        console.error('[GladTidings] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Mask phone number for logging purposes
   */
  private maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || phoneNumber.length < 8) return phoneNumber;
    const start = phoneNumber.substring(0, 4);
    const end = phoneNumber.substring(phoneNumber.length - 4);
    return `${start}****${end}`;
  }

  /**
   * Get network ID for GladTidings API
   */
  private getNetworkId(network: string): number {
    const networkKey = network.toLowerCase() as keyof typeof NETWORK_MAPPING;
    const networkId = NETWORK_MAPPING[networkKey];
    
    if (!networkId) {
      throw new Error(`Unsupported network: ${network}`);
    }
    
    return networkId;
  }

  /**
   * Format phone number for GladTidings API
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('234')) {
      // Remove country code and add leading 0
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('+234')) {
      // Remove country code with + and add leading 0
      cleaned = '0' + cleaned.substring(4);
    } else if (!cleaned.startsWith('0')) {
      // Add leading 0 if not present
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Generate unique identifier for transaction tracking
   */
  private generateIdent(transactionId: string): string {
    const timestamp = Date.now();
    return `Data${transactionId.replace(/-/g, '').substring(0, 10)}${timestamp}`.substring(0, 30);
  }

  /**
   * Purchase data bundle
   */
  async purchaseData(params: {
    network: string;
    phoneNumber: string;
    planId: number;
    transactionId: string;
    portedNumber?: boolean;
  }): Promise<GladTidingsDataResponse> {
    try {
      const networkId = this.getNetworkId(params.network);
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
      const ident = this.generateIdent(params.transactionId);

      const requestData: GladTidingsDataRequest = {
        network: networkId,
        mobile_number: formattedPhone,
        plan: params.planId,
        Ported_number: params.portedNumber ?? true, // Default to true as per example
        ident: ident
      };

      console.log(`[GladTidings] Purchasing data for ${this.maskPhoneNumber(formattedPhone)}, Plan: ${params.planId}, Network: ${params.network}`);

      const response = await this.client.post<GladTidingsDataResponse>('/v2/api/data/', requestData);

      if (response.data.Status !== 'successful') {
        throw new Error(`Data purchase failed: ${response.data.api_response || 'Unknown error'}`);
      }

      console.log(`[GladTidings] Data purchase successful for transaction ${params.transactionId}`);
      return response.data;

    } catch (error) {
      console.error('[GladTidings] Data purchase failed:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<GladTidingsError>;
        
        if (axiosError.response) {
          // Server responded with error status
          const errorData = axiosError.response.data;
          throw new Error(`GladTidings API Error (${axiosError.response.status}): ${errorData?.message || errorData?.error || 'Unknown error'}`);
        } else if (axiosError.request) {
          // Request timeout or network error
          throw new Error('Network error: Unable to connect to GladTidings API. Please try again.');
        }
      }
      
      throw error instanceof Error ? error : new Error('Unknown error occurred during data purchase');
    }
  }

  /**
   * Check account balance (if endpoint is available)
   */
  async checkBalance(): Promise<{ balance: string; currency: string }> {
    try {
      // This endpoint might need to be confirmed with GladTidings API documentation
      const response = await this.client.get('/api/balance/');
      return response.data;
    } catch (error) {
      console.error('[GladTidings] Balance check failed:', error);
      throw new Error('Failed to check account balance');
    }
  }

  /**
   * Verify transaction status (if endpoint is available)
   */
  async verifyTransaction(transactionId: string): Promise<GladTidingsDataResponse> {
    try {
      // This endpoint might need to be confirmed with GladTidings API documentation
      const response = await this.client.get(`/api/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('[GladTidings] Transaction verification failed:', error);
      throw new Error('Failed to verify transaction status');
    }
  }
}

// Export singleton instance
export const gladTidingsService = new GladTidingsService();
export default gladTidingsService;