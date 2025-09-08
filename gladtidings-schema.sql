-- GladTidings Data Purchase Platform Database Schema
-- Simplified schema focused on GladTidings integration first

-- Networks table
CREATE TABLE networks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- MTN, GLO, AIRTEL, 9MOBILE
    code VARCHAR(10) UNIQUE NOT NULL, -- mtn, glo, airtel, 9mobile
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GladTidings Data Plans
CREATE TABLE data_plans (
    id SERIAL PRIMARY KEY,
    gladtidings_plan_id VARCHAR(100) NOT NULL UNIQUE, -- Their plan ID (167, 168, etc.)
    network_id INTEGER REFERENCES networks(id),
    plan_type VARCHAR(50) DEFAULT 'SME', -- SME, GIFTING, CORPORATE
    data_amount VARCHAR(50) NOT NULL, -- '2 GB', '500 MB', etc.
    data_amount_mb INTEGER, -- Normalized to MB for sorting
    validity_days INTEGER,
    validity_text VARCHAR(50), -- '30 days', '7 days', etc.
    
    -- GladTidings Pricing
    gladtidings_amount DECIMAL(10,2) NOT NULL, -- What we pay GladTidings (API Amount)
    customer_amount DECIMAL(10,2) NOT NULL, -- What customer pays (Resell Amount)
    profit DECIMAL(10,2) GENERATED ALWAYS AS (customer_amount - gladtidings_amount) STORED,
    original_amount DECIMAL(10,2), -- Their original amount for reference
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions focused on GladTidings workflow
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    network_id INTEGER REFERENCES networks(id),
    data_plan_id INTEGER REFERENCES data_plans(id),
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL, -- Customer pays this
    gladtidings_cost DECIMAL(10,2) NOT NULL, -- We pay GladTidings this
    profit DECIMAL(10,2) GENERATED ALWAYS AS (amount - gladtidings_cost) STORED,
    
    -- Status tracking
    status ENUM('pending', 'payment_pending', 'payment_confirmed', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    
    -- External references
    payment_reference VARCHAR(255), -- ErcasPay reference
    gladtidings_reference VARCHAR(255), -- GladTidings transaction ref
    gladtidings_response JSONB, -- Store full API response
    
    -- Timing
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_confirmed_at TIMESTAMP,
    gladtidings_submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Error handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment records (ErcasPay integration)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    ercaspay_reference VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'successful', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    ercaspay_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GladTidings API logs for debugging
CREATE TABLE gladtidings_logs (
    id SERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    endpoint VARCHAR(100), -- e.g., '/data-purchase', '/balance-check'
    request_payload JSONB,
    response_payload JSONB,
    response_code INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook logs (both ErcasPay and GladTidings)
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- 'ercaspay' or 'gladtidings'
    event_type VARCHAR(100),
    reference_id VARCHAR(255),
    payload JSONB,
    status ENUM('received', 'processed', 'failed') DEFAULT 'received',
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration for GladTidings
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_data_plans_network ON data_plans(network_id, is_available);
CREATE INDEX idx_data_plans_gladtidings_id ON data_plans(gladtidings_plan_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_phone_date ON transactions(phone_number, created_at);
CREATE INDEX idx_transactions_payment_ref ON transactions(payment_reference);
CREATE INDEX idx_transactions_gladtidings_ref ON transactions(gladtidings_reference);
CREATE INDEX idx_payments_ercaspay_ref ON payments(ercaspay_reference);
CREATE INDEX idx_gladtidings_logs_transaction ON gladtidings_logs(transaction_id);

-- View for available plans with network info
CREATE VIEW available_plans_view AS
SELECT 
    dp.id,
    dp.gladtidings_plan_id,
    dp.network_id,
    n.name as network_name,
    n.code as network_code,
    dp.plan_type,
    dp.data_amount,
    dp.data_amount_mb,
    dp.validity_text,
    dp.gladtidings_amount,
    dp.customer_amount,
    dp.profit,
    dp.is_available
FROM data_plans dp
JOIN networks n ON dp.network_id = n.id
WHERE dp.is_available = TRUE 
AND n.is_active = TRUE
ORDER BY n.name, dp.data_amount_mb;

-- Function to get plans by network
CREATE OR REPLACE FUNCTION get_plans_by_network(p_network_code VARCHAR)
RETURNS TABLE(
    plan_id INTEGER,
    gladtidings_plan_id VARCHAR,
    data_amount VARCHAR,
    validity_text VARCHAR,
    customer_amount DECIMAL,
    profit DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.id,
        dp.gladtidings_plan_id,
        dp.data_amount,
        dp.validity_text,
        dp.customer_amount,
        dp.profit
    FROM data_plans dp
    JOIN networks n ON dp.network_id = n.id
    WHERE n.code = p_network_code
    AND dp.is_available = TRUE
    AND n.is_active = TRUE
    ORDER BY dp.data_amount_mb;
END;
$$ LANGUAGE plpgsql;

-- Function to create transaction
CREATE OR REPLACE FUNCTION create_transaction(
    p_phone_number VARCHAR,
    p_network_code VARCHAR,
    p_gladtidings_plan_id VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_network_id INTEGER;
    v_plan_id INTEGER;
    v_customer_amount DECIMAL;
    v_gladtidings_cost DECIMAL;
BEGIN
    -- Get network ID
    SELECT id INTO v_network_id FROM networks WHERE code = p_network_code;
    
    -- Get plan details
    SELECT id, customer_amount, gladtidings_amount 
    INTO v_plan_id, v_customer_amount, v_gladtidings_cost
    FROM data_plans 
    WHERE gladtidings_plan_id = p_gladtidings_plan_id;
    
    -- Create transaction
    INSERT INTO transactions (
        phone_number, 
        network_id, 
        data_plan_id, 
        amount, 
        gladtidings_cost
    ) VALUES (
        p_phone_number,
        v_network_id,
        v_plan_id,
        v_customer_amount,
        v_gladtidings_cost
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;