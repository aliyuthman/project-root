/**
 * Backend Configuration
 * Centralized configuration for all environment variables and external services
 */

import dotenv from 'dotenv';

dotenv.config();

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
  environment: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001"),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  url: getEnvVar("DATABASE_URL"),
  supabase: {
    url: getEnvVar("SUPABASE_URL"),
    anonKey: getEnvVar("SUPABASE_ANON_KEY"),
    serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
  },
  logging: process.env.DATABASE_LOGGING === "true",
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
  webhookSecret: process.env.ERCASPAY_WEBHOOK_SECRET || "",
  webhookUrl: process.env.ERCASPAY_WEBHOOK_URL || "",
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
  jwtSecret: getEnvVar("JWT_SECRET", "development-secret"),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },
} as const;

// Logging Configuration
export const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || "info",
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === "true",
  debugMode: process.env.DEBUG_MODE === "true",
} as const;

// External Services Configuration
export const EXTERNAL_SERVICES_CONFIG = {
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
  },
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

// Validation function to check if all required environment variables are set
export const validateEnvironment = () => {
  const requiredVars = [
    "DATABASE_URL",
    "SUPABASE_URL", 
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "JWT_SECRET",
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
      "Please check your .env.local file and ensure all required variables are set."
    );
  }

  // Warn about optional but recommended variables
  const recommendedVars = [
    "ERCASPAY_SANDBOX_PUBLIC_KEY",
    "ERCASPAY_SANDBOX_SECRET_KEY",
    "GLADTIDINGS_API_KEY",
  ];

  const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
  
  if (missingRecommended.length > 0 && LOGGING_CONFIG.debugMode) {
    console.warn(
      `Warning: Missing recommended environment variables: ${missingRecommended.join(", ")}\n` +
      "Some features may not work properly without these variables."
    );
  }
};

// Main Configuration Export
export const config = {
  app: APP_CONFIG,
  database: DATABASE_CONFIG,
  ercaspay: ERCASPAY_CONFIG,
  gladtidings: GLADTIDINGS_CONFIG,
  security: SECURITY_CONFIG,
  logging: LOGGING_CONFIG,
  externalServices: EXTERNAL_SERVICES_CONFIG,
  network: NETWORK_CONFIG,
} as const;

// Export types for TypeScript
export type Network = typeof NETWORK_CONFIG.supportedNetworks[number];
export type Environment = "development" | "production" | "test";
export type ErcasPayEnvironment = "sandbox" | "live";