-- GladTidings Data Purchase Platform Schema
-- Migration: Create core tables for GladTidings integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Networks table
CREATE TABLE networks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GladTidings Data Plans
CREATE TABLE data_plans (
    id SERIAL PRIMARY KEY,
    gladtidings_plan_id VARCHAR(100) NOT NULL UNIQUE,
    network_id INTEGER REFERENCES networks(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) DEFAULT 'SME',
    data_amount VARCHAR(50) NOT NULL,
    data_amount_mb INTEGER,
    validity_days INTEGER,
    validity_text VARCHAR(50),
    
    -- Pricing from GladTidings
    gladtidings_amount DECIMAL(10,2) NOT NULL,
    customer_amount DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (customer_amount - gladtidings_amount) STORED,
    original_amount DECIMAL(10,2),
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    network_id INTEGER REFERENCES networks(id),
    data_plan_id INTEGER REFERENCES data_plans(id),
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    gladtidings_cost DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (amount - gladtidings_cost) STORED,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'payment_confirmed', 'processing', 'completed', 'failed', 'refunded')),
    
    -- External references
    payment_reference VARCHAR(255),
    gladtidings_reference VARCHAR(255),
    gladtidings_response JSONB,
    
    -- Timing
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    gladtidings_submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (ErcasPay integration)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    ercaspay_reference VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    ercaspay_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GladTidings API logs
CREATE TABLE gladtidings_logs (
    id SERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    endpoint VARCHAR(100),
    request_payload JSONB,
    response_payload JSONB,
    response_code INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook logs
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    reference_id VARCHAR(255),
    payload JSONB,
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_data_plans_network ON data_plans(network_id, is_available);
CREATE INDEX idx_data_plans_gladtidings_id ON data_plans(gladtidings_plan_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_phone_date ON transactions(phone_number, created_at);
CREATE INDEX idx_transactions_payment_ref ON transactions(payment_reference);
CREATE INDEX idx_transactions_gladtidings_ref ON transactions(gladtidings_reference);
CREATE INDEX idx_payments_ercaspay_ref ON payments(ercaspay_reference);
CREATE INDEX idx_gladtidings_logs_transaction ON gladtidings_logs(transaction_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();