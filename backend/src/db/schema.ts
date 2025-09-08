import { pgTable, uuid, varchar, decimal, timestamp, text, boolean, json, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Data aggregator providers table
export const dataProviders = pgTable('data_providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // 'gladtidings', 'vtpass', 'clubkonnect'
  display_name: varchar('display_name', { length: 100 }).notNull(),
  base_url: varchar('base_url', { length: 255 }).notNull(),
  api_key: text('api_key'),
  config: json('config'), // Provider-specific configuration
  is_active: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(1).notNull(), // For fallback ordering
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone_number: varchar('phone_number', { length: 20 }).notNull(),
  network: varchar('network', { length: 20 }).notNull(),
  data_plan_id: uuid('data_plan_id').references(() => dataPlans.id).notNull(),
  data_plan_name: varchar('data_plan_name', { length: 100 }).notNull(), // For display
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  payment_reference: varchar('payment_reference', { length: 100 }),
  data_provider_id: uuid('data_provider_id').references(() => dataProviders.id),
  provider_reference: varchar('provider_reference', { length: 100 }), // Generic provider ref
  provider_response: json('provider_response'), // Store full provider response
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => transactions.id).notNull(),
  ercaspay_reference: varchar('ercaspay_reference', { length: 100 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  payment_method: varchar('payment_method', { length: 50 }),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Data plans table - Normalized across all providers
export const dataPlans = pgTable('data_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  network: varchar('network', { length: 20 }).notNull(), // 'mtn', 'airtel', 'glo', '9mobile'
  plan_name: varchar('plan_name', { length: 100 }).notNull(), // Display name
  data_amount: varchar('data_amount', { length: 50 }).notNull(), // e.g., "1GB", "5GB"
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Customer price
  cost_price: decimal('cost_price', { precision: 10, scale: 2 }), // Our cost from provider
  validity: varchar('validity', { length: 50 }).notNull(), // e.g., "30 days"
  plan_type: varchar('plan_type', { length: 50 }), // SME, Corporate Gifting, etc.
  is_available: boolean('is_available').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Provider-specific plan mappings
export const providerPlanMappings = pgTable('provider_plan_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  data_plan_id: uuid('data_plan_id').references(() => dataPlans.id).notNull(),
  data_provider_id: uuid('data_provider_id').references(() => dataProviders.id).notNull(),
  provider_plan_id: varchar('provider_plan_id', { length: 100 }).notNull(), // Provider's plan ID
  provider_network_id: varchar('provider_network_id', { length: 20 }), // Provider's network ID
  provider_metadata: json('provider_metadata'), // Provider-specific data
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Webhooks table
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  source: varchar('source', { length: 50 }).notNull(), // 'ercaspay', 'gladtidings', 'vtpass', etc.
  event_type: varchar('event_type', { length: 50 }).notNull(),
  reference_id: varchar('reference_id', { length: 100 }).notNull(),
  transaction_id: uuid('transaction_id').references(() => transactions.id), // Link to transaction if applicable
  payload: json('payload').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('received'),
  processed_at: timestamp('processed_at'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Zod schemas for validation
export const insertDataProviderSchema = createInsertSchema(dataProviders);
export const selectDataProviderSchema = createSelectSchema(dataProviders);
export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const insertDataPlanSchema = createInsertSchema(dataPlans);
export const selectDataPlanSchema = createSelectSchema(dataPlans);
export const insertProviderPlanMappingSchema = createInsertSchema(providerPlanMappings);
export const selectProviderPlanMappingSchema = createSelectSchema(providerPlanMappings);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const selectWebhookSchema = createSelectSchema(webhooks);

// Types
export type DataProvider = z.infer<typeof selectDataProviderSchema>;
export type NewDataProvider = z.infer<typeof insertDataProviderSchema>;
export type Transaction = z.infer<typeof selectTransactionSchema>;
export type NewTransaction = z.infer<typeof insertTransactionSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;
export type NewPayment = z.infer<typeof insertPaymentSchema>;
export type DataPlan = z.infer<typeof selectDataPlanSchema>;
export type NewDataPlan = z.infer<typeof insertDataPlanSchema>;
export type ProviderPlanMapping = z.infer<typeof selectProviderPlanMappingSchema>;
export type NewProviderPlanMapping = z.infer<typeof insertProviderPlanMappingSchema>;
export type Webhook = z.infer<typeof selectWebhookSchema>;
export type NewWebhook = z.infer<typeof insertWebhookSchema>;