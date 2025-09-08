/**
 * API Clients Index
 * Central export point for all API clients and related types
 */

// ErcasPay Payment Gateway
export {
  ercasPayClient,
  type PaymentInitializationRequest,
  type PaymentInitializationResponse,
  type PaymentVerificationResponse,
  type WebhookPayload,
} from './ercaspay';

// GladTidingsData API
export {
  gladTidingsClient,
  type DataPlan,
  type DataPurchaseRequest,
  type DataPurchaseResponse,
  type BalanceResponse,
  type TransactionStatusResponse,
  type NetworkStatusResponse,
} from './gladtidings';

// Re-export configuration types
export type { Network, Environment, ErcasPayEnvironment } from '../config';