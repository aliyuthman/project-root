/**
 * Application Configuration
 * Centralized configuration for all environment variables and external services
 */

// Environment validation helper
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
};

// Application Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "DataPurchase NG",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  environment: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Backend API Configuration 
export const BACKEND_CONFIG = {
  url: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
} as const;

// Payment Gateway Configuration (ErcasPay)
export const ERCASPAY_CONFIG = {
  environment: (process.env.ERCASPAY_ENVIRONMENT || "sandbox") as "sandbox" | "live",
  sandbox: {
    baseUrl: process.env.ERCASPAY_SANDBOX_BASE_URL || "https://api.merchant.staging.ercaspay.com/api/v1",
    publicKey: process.env.ERCASPAY_SANDBOX_PUBLIC_KEY || "",
    secretKey: process.env.ERCASPAY_SANDBOX_SECRET_KEY || "",
  },
  live: {
    baseUrl: process.env.ERCASPAY_LIVE_BASE_URL || "https://api.ercaspay.com/api/v1",
    publicKey: process.env.ERCASPAY_LIVE_PUBLIC_KEY || "",
    secretKey: process.env.ERCASPAY_LIVE_SECRET_KEY || "",
  },
  webhook: {
    secret: process.env.ERCASPAY_WEBHOOK_SECRET || "",
    url: process.env.NEXT_PUBLIC_ERCASPAY_WEBHOOK_URL || "",
  },
  // Get current environment configuration
  get current() {
    return this.environment === "sandbox" ? this.sandbox : this.live;
  },
} as const;

// Data Aggregator Configuration (GladTidingsData)
export const GLADTIDINGS_CONFIG = {
  baseUrl: process.env.GLADTIDINGS_BASE_URL || "https://api.gladtidingsdata.com",
  apiKey: process.env.GLADTIDINGS_API_KEY || "",
  apiSecret: process.env.GLADTIDINGS_API_SECRET || "",
  webhookUrl: process.env.GLADTIDINGS_WEBHOOK_URL || "",
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || "development-secret",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  },
} as const;

// Monitoring Configuration
export const MONITORING_CONFIG = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  },
} as const;

// External Services Configuration
export const EXTERNAL_SERVICES_CONFIG = {
  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASS || "",
    },
  },
  sms: {
    apiKey: process.env.SMS_API_KEY || "",
    senderId: process.env.SMS_SENDER_ID || "DataPurchase",
  },
} as const;

// Development Configuration
export const DEV_CONFIG = {
  debugMode: process.env.DEBUG_MODE === "true",
  logLevel: process.env.LOG_LEVEL || "info",
  databaseLogging: process.env.DATABASE_LOGGING === "true",
} as const;

// API Endpoints Configuration
export const API_ROUTES = {
  // Data Plans
  dataPlans: (network: string) => `/api/data-plans/${network}`,
  
  // Transactions
  transactions: "/api/transactions",
  transactionStatus: (id: string) => `/api/transactions/${id}/status`,
  
  // Payments
  paymentInitialize: "/api/payments/initialize",
  paymentWebhook: "/api/webhooks/ercaspay",
  
  // Data Delivery
  dataDeliveryWebhook: "/api/webhooks/gladtidings",
  
  // Health Check
  health: "/api/health",
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  supportedNetworks: ["mtn", "airtel", "glo", "9mobile"] as const,
  prefixes: {
    mtn: ["0803", "0806", "0813", "0816", "0903", "0906", "0913", "0916"],
    airtel: ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0907", "0912"],
    glo: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"],
    "9mobile": ["0809", "0817", "0818", "0909", "0908"],
  },
} as const;

// Validation helper to check if all required environment variables are set
export const validateEnvironment = () => {
  const requiredVars = [
    "NEXT_PUBLIC_BACKEND_URL",
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing required environment variables: ${missingVars.join(", ")}\n` +
      "Some features may not work properly without these variables."
    );
  }
};

// Export types for TypeScript
export type Network = typeof NETWORK_CONFIG.supportedNetworks[number];
export type Environment = "development" | "production" | "test";
export type ErcasPayEnvironment = "sandbox" | "live";